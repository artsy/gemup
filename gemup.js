(function() {

  var gemup = function(file, options) {

    // Set defaults
    var defaults = {
      acl: 'public-read',
      app: 'force',
      add: function(){},
      progress: function(){},
      done: function(){},
      fail: function(){}
    }
    for (key in defaults) {
      if (!options[key]) options[key] = defaults[key];
    }

    // Read the file & send the client-side base64 url
    var reader = new FileReader();
    reader.onload = function() {
      options.add(reader.result);
    }
    reader.readAsDataURL(file);

    // Get S3 credentials from Gemini
    var key = key = btoa(unescape(encodeURIComponent(options.app + ':')));
    $.ajax({
      url: 'https://media.artsy.net/uploads/new.json',
      data: {
        acl: options.acl
      },
      headers: {
        'Authorization': 'Basic ' + key
      },
      error: options.fail,
      success: function(res) {

        // Build the S3 form data
        var formData = new FormData();
        var geminiKey = res.policy_document.conditions[1][2]
        var key = geminiKey + "/${filename}"
        var bucket = res.policy_document.conditions[0].bucket
        var data = {
          'Content-Type': 'image/png',
          key: key,
          AWSAccessKeyId: res.credentials,
          acl: options.acl,
          success_action_status: res.policy_document.conditions[3].success_action_status,
          policy: res.policy_encoded,
          signature: res.signature,
          file: file
        };
        for (key in data) {
          formData.append(key, data[key]);
        }

        // Send the file upload XHR to S3
        $.ajax({
          url: 'https://' + bucket + '.s3.amazonaws.com',
          type: 'POST',
          processData: false,
          contentType: false,
          data: formData,
          error: options.fail,

          // Send progress updates
          xhr: function() {
            var xhr = $.ajaxSettings.xhr();
            if (!xhr.upload) return xhr;
            xhr.upload.addEventListener('progress', function(e) {
              options.progress(e.loaded / e.total);
            });
            return xhr;
          },

          // Pull out the image url and call done
          success: function(res) {
            options.done($(res).find('Location').text(), key, bucket);
          }
        });
      }
    });
  }

  // Export for CommonJS & window global
  if (typeof module != 'undefined') {
    module.exports = gemup;
  } else {
    window.gemup = gemup;
  }
})();