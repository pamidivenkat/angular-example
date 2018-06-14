const restClient = require('./../common/rest.service');
const {
  getBlobStream
} = require('./../common/blob.service');
const mime = require('mime-types');
const querystring = require('querystring');

function downloadAsAttachment(request, reply) {
  const token = request.state.token;
  const documentId = request.query.documentId;
  const documentVersionId = request.query.documentVersionId;
  const sharedDocumentId = request.query.sharedDocumentId;
  const cid = request.query.cid;
  const isSystem = request.query.isSystem;
  const version = request.query.version;

  let path = 'download?';
  if (documentId) {
    path = path + 'documentId=' + documentId;
    if (isSystem && isSystem == 'true')
      path = path + '&isSystem=true';
    else
      path = path + '&isSystem=false';

  } else if (documentVersionId) {
    path = path + 'documentVersionId=' + documentVersionId;
  } else if (sharedDocumentId) {
    path = path + 'sharedDocumentId=' + sharedDocumentId + '&isShared=true';
  }

  if (cid)
    path = path + '&cid=' + cid;

  if (version)
    path = path + '&version=' + version;

  let headers;
  if (request.headers.pdfgenerator) {
    headers = { 'PDFGENERATOR': request.headers.pdfgenerator };
  }
  
  restClient.get(token, path, headers).then((result) => {
    var jsonResult = JSON.parse(result);
    getBlobStream(jsonResult.Container, jsonResult.FileStorageIdentifier).then((stream) => {
      let cacheHeader = (jsonResult.CanBeCached) ? 'max-age=2592000, must-revalidate, private' : 'no-cache';
      return reply(stream)
        .type(jsonResult.MimeType)        
        .header('Content-Disposition', `attachment;category="${jsonResult.CategoryName}";company="Citation";author="${jsonResult.Author}";filename="${encodeURIComponent(jsonResult.FileName)}";publisher="Citation";creation-date=${jsonResult.CreatedOn};modification-date=${jsonResult.ModifiedOn}`)
        .header('cache-control', cacheHeader);

    }, (err) => {
      reply(err);
    });
  }, (err) => {
    reply(err);
  });
}

function streamFile(request, reply) {
  const token = request.state.token;
  const module = querystring.unescape(request.params.module);
  const filePath = request.params.filePath;
  let path = `${module}/${filePath}`;

  getBlobStream('trainingmaterial', path).then((stream) => {
    let cacheHeader = 'max-age=108000, must-revalidate, public';
    let mimeType = mime.lookup(path);
    return reply(stream)
      .type(mimeType)
      .header('cache-control', cacheHeader);

  }, (err) => reply(err));
}

module.exports = {
  downloadAsAttachment,
  streamFile
}
