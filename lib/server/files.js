var filesBucket = "YOURBUCKET";

var filesStore = new FS.Store.S3("files", {
	accessKeyId: "ACCESSKEYID", //required if environment variables are not set
	secretAccessKey: "SECRETACCESSKEY", //required if environment variables are not set
	bucket: filesBucket, //required
	ACL: "public-read", //optional, default is 'private', but you can allow public or secure access routed through your app URL,
	folder: "/filestest"
});

var filesThumbStore = new FS.Store.S3("filesthumbs", {
	accessKeyId: "YOURACCESSKEY", //required if environment variables are not set
	secretAccessKey: "SECRETACCESSKEY", //required if environment variables are not set
	bucket: filesBucket, //required
	ACL: "public-read", //optional, default is 'private', but you can allow public or secure access routed through your app URL,
	folder: "/filestest/thumbs",
	transformWrite: function(fileObj,readStream,writeStream){
		var re = /(^image\/)/i;
		var re2 = /(^application\/x-photoshop$)/i;
		if(fileObj.original.size < 4194304 && (re.test(fileObj.copies.filesthumbs.type) || re2.test(fileObj.copies.filesthumbs.type))){
			try {
			    fileObj.copies.filesthumbs.name = FS.Utility.setFileExtension(fileObj.copies.filesthumbs.name, 'png');
				fileObj.copies.filesthumbs.type = 'image/png';

				var desiredSize = 190;
				gm(readStream)
				.size({
					bufferStream: true
				}, function (err, size) {
					if(!size){
						return false;
					}
					if (size.width === size.height) {
						//console.log('equal size');
						this.thumbnail(desiredSize, desiredSize);
						this.noProfile();
						this.gravity('Center');
						this.extent(desiredSize, desiredSize);
						this.stream(function (err, stdout, stderr) {
							stdout.pipe(writeStream);
						});
					} else if (size.width > size.height) {
						//console.log('width greater')
						this.thumbnail(desiredSize + '^', desiredSize);
						this.noProfile();
						this.gravity('Center');
						this.extent(desiredSize, desiredSize);
						this.stream(function (err, stdout, stderr) {
							stdout.pipe(writeStream);
						});
					} else {
						// console.log('height greater');
						this.thumbnail(desiredSize, desiredSize + '^');
						this.noProfile();
						this.gravity('Center');
						this.extent(desiredSize, desiredSize);
						this.stream(function (err, stdout, stderr) {
							stdout.pipe(writeStream);
						});
					}
				});
			}
			catch(err) {
			    console.log("Al generar miniatura:" + err);
			}
		}
		else
		{
		  return false;
		}
	}
});

Files = new FS.Collection("files", {
	stores: [filesStore,filesThumbStore]
});

Files.on('stored', Meteor.bindEnvironment(
	function (fileObj,storename) {
		if(storename === "files")
		{
			console.log("uploaded");
	 	}
	},
	function(err){
		console.log(err);
	}
));


Files.on('error',function(fileObj,storename){
	console.log("ERROR UPLOADING");
	console.log(fileObj);
});


Files.allow({
	insert: function (userId, file) {
		return true;
	},
	update: function (userId, file, fields, modifier) {
		return true;
	},
	remove: function (userId, file) {
		return true;
	},
	download: function (userId, file) {
		return true;
	}
});