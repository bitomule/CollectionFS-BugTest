if (Meteor.isClient) {
  Template.hello.events({
    'change .myFileInput': function(event, template) {
      var files = event.target.files;
      for (var i = 0, ln = files.length; i < ln; i++) {
        Files.insert(files[i], function (err, fileObj) {
          // Inserted new doc with ID fileObj._id, and kicked off the data upload using HTTP
        });
      }
    }
  });
}
