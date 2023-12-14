(function () {
  const gemup = function (file, options) {
    function generateUUID() {
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
      });
    }

    // Set defaults
    const defaults = {
      acl: 'public-read',
      app: 'force',
      geminiHost: 'https://media.artsy.net',
      sanitizeFilename: false,
      add: function () { },
      progress: function () { },
      done: function () { },
      fail: function () { }
    };

    for (let key in defaults) {
      if (!options[key]) options[key] = defaults[key];
    }

    // Read the file & send the client-side base64 url
    const reader = new FileReader();

    reader.onload = function () {
      options.add(reader.result);
    };

    reader.readAsDataURL(file);

    // Get S3 credentials from Gemini
    const key = btoa(unescape(encodeURIComponent(`${options.app}:`)));
    const request = new XMLHttpRequest();

    request.open('GET', `${options.geminiHost}/uploads/new.json?acl=${options.acl}`, true);

    request.setRequestHeader('Authorization', `Basic ${key}`);

    request.addEventListener('load', function () {
      if (request.status >= 200 && request.status < 400) {
        const res = JSON.parse(request.responseText);

        // Build the S3 form data
        const formData = new FormData();
        const geminiKey = res.policy_document.conditions[1][2];
        const bucket = res.policy_document.conditions[0].bucket;

        const data = {
          'Content-Type': file.type,
          key: `${geminiKey}/${options.sanitizeFilename ? generateUUID() : "${filename}"}`,
          AWSAccessKeyId: res.credentials,
          acl: options.acl,
          success_action_status: res.policy_document.conditions[3].success_action_status,
          policy: res.policy_encoded,
          signature: res.signature,
          file: file
        };

        for (let key in data) {
          formData.append(key, data[key]);
        }

        // Send the file upload XHR to S3
        const xhr = new XMLHttpRequest();
        xhr.open('POST', `https://${bucket}.s3.amazonaws.com`, true);
        xhr.onerror = options.fail;

        // Send progress updates
        xhr.upload.addEventListener('progress', function (e) {
          if (e.lengthComputable) {
            options.progress(e.loaded / e.total);
          }
        });

        // Pull out the image URL and call done
        xhr.addEventListener('load', function () {
          if (xhr.status >= 200 && xhr.status < 400) {
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(xhr.responseText, 'text/xml');
            const location = xmlDoc.getElementsByTagName('Location')[0].textContent;
            options.done(location, geminiKey, bucket);
          } else {
            options.fail(xhr.statusText);
          }
        });

        xhr.send(formData);
      } else {
        options.fail(request.statusText);
      }
    });

    request.addEventListener('error', options.fail);
    request.send();
  };

  // Export for CommonJS & window global
  if (typeof module !== 'undefined') {
    module.exports = gemup;
  } else {
    window.gemup = gemup;
  }
})();
