# gemup

Lightweight Javascript utility for using Artsy's Gemini service to upload directly to S3. Used internally at Artsy, so not useful to general public—but open source by default!

## Example

Add to your script tags

````html
<html>
  <body>
    <script src='gemup.js'></script>
  </body>
</html>
````

or require via browserify

````javascript
var gemup = require('gemup');
````

Use a file input

````html
<input id="my-uploader" type="file" multiple="">
````

Upload some files to S3 when someone changes it.

````javascript
$('#my-uploader').on('change', function(e) {
  gemup(e.target.files[0],{
    app: 'force',
    geminiHost: 'https://media.artsy.net',
    fail: function(err) {
      console.log("Ouch!", err);
    },
    add: function(src) {
      console.log("We got a data-uri image client-side!", src);
    },
    progress: function(percent) {
      console.log("<3 progress bars, file is this % uploaded: ", percent);
    },
    done: function(src) {
      console.log("Done uploading, here's the S3 url: ", src);
    }
  });
});
````

In coffeescript:

````coffeescript
$("#my-uploader").on "change", (e) ->
  gemup e.target.files[0],
    app: "force"
    key: "SECRET_GEMINI_S3_KEY"
    fail: (err) ->
      console.log "Ouch!", err
    add: (src) ->
      console.log "We got a data-uri image client-side!", src
    progress: (percent) ->
      console.log "<3 progress bars, file is this % uploaded: ", percent
    done: (src) ->
      console.log "Done uploading, here's the S3 url: ", src
````

## Notes

Currently only works with jQuery 2.x available globally—but hopefully dropping that dependency down the line.

## License

MIT
