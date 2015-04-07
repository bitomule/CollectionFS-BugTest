var filesStore = new FS.Store.S3("files");
var filesThumbStore = new FS.Store.S3("filesthumbs");

Files = new FS.Collection("files", {
  stores: [filesStore,filesThumbStore]
});