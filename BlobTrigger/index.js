const axios = require('axios')
const mime = require('mime-types')
const storage = require('@azure/storage-blob');
const path = require('path')

const API_ENDPOINT_BASE = process.env['API_ENDPOINT_BASE']
const API_KEY = process.env['API_KEY']
const fileStorage = process.env['fileStorage']
const containerClient = storage.BlobServiceClient.fromConnectionString(fileStorage).getContainerClient('input')

module.exports.index = async function(context, inputBlob) {
const inputBlobName = path.basename(context.bindingData.blobTrigger)
    try {
        context.log(`Async Api blob trigger function triggered by "${inputBlobName}" (filesize: ${inputBlob.length} Bytes)`)

        const guessedMimeType = mime.lookup(inputBlobName)
        if(guessedMimeType) 
            context.log(`Guessed mime type for "${inputBlobName}" is ${guessedMimeType}`)
        else
            throw new Error("Mime type could not be guessed (missing or unknown suffix)")

        context.log(`Sending "${inputBlobName}" to Async API`)
        const initResponse = await init(API_ENDPOINT_BASE, API_KEY, guessedMimeType)
        await upload(initResponse.data.links.upload, inputBlob)
        context.log(`"${inputBlobName}" has been sent. Transform pending...`)
        const resultLink = await checkStatusUntilComplete(initResponse.data.links.status)
        const downloadResponse = await download(resultLink)

        
        containerClient.getBlockBlobClient(inputBlobName).deleteIfExists()

        context.log(`"${inputBlobName}" successfully transformed`)

        return {
            successBlob: downloadResponse.data
        }
    }
    catch(err) {
        containerClient.getBlockBlobClient(inputBlobName).deleteIfExists()

        context.log.error(`An error has occured during the processing of "${inputBlobName}"`)

        if(err.response && err.response.data) {
            try {
                const parsedJsonError = JSON.parse(err.response.data)
                context.log.error(parsedJsonError)
                return {
                    errorBlob: parsedJsonError
                }
            }
            catch(json_err) {
                try {
                    const statusString = `HTTP ${err.response.status} ${err.response.statusText}`
                    const parsedHttpData = new Buffer.from(err.response.data).toString()
                    const httpError = {"error": {"type": statusString, "message": parsedHttpData}};
                    context.log.error(httpError)
                    return {
                        errorBlob: httpError
                    }
                }
                catch(parse_err) {
                    return {
                        errorBlob: err.response.data
                    }
                }

            }
        }
        else {
            const sampleCodeError = {"error": {"type": "ASYNC_API_CODE_SAMPLE_ERROR", "message": err.message}};
            context.log.error(sampleCodeError)
            return {
                errorBlob: sampleCodeError
            }
        }
    }
};

const delay = ms => new Promise(r => setTimeout(r, ms))

async function init(apiEndpointBase, apiKey, mimeType) {
    return await axios({
        method: 'POST',
        url: apiEndpointBase + '/initiate',
        headers: {
            'x-api-key': apiKey,
            'Content-Type': 'application/json'
        },
        data: {
            'mime-type': mimeType
        }
    })
}

async function upload(uploadLink, inputBlob) {
    return await axios({
            method: uploadLink.method,
            headers: uploadLink.headers,
            url: uploadLink.url,
            maxBodyLength: Math.max(20000, inputBlob.length),
            data: inputBlob
        })
    }

async function checkStatusUntilComplete(statusLink, etag) {

    await delay(1000)
    const response = await axios({
        validateStatus: status => status < 400 || status == 404,
        headers: Object.assign({ 'If-None-Match' : etag || '' }, statusLink.headers),
        url: statusLink.url,
        method: statusLink.method
    })

    if (response.status != 304) {
        if (response.data.status && response.data.status.complete)
            return response.data.status.success
                ? response.data.links.result
                : Promise.reject(response.data.error)
        statusLink = response.data.links.status
    }
    return await checkStatusUntilComplete(statusLink, response.headers['etag'])
}

async function download(resultLink) {
    return await axios.request({
        url: resultLink.url,
        method: resultLink.method,
        headers: resultLink.headers,
        maxContentLength: Math.max(20000, resultLink.fileSize),
        responseType: 'arraybuffer'
    })
}