# gemup

Lightweight Javascript utility for using Artsy's Gemini service to upload directly to S3. Used internally at Artsy, so not useful to general public—but open source by default!

## Installation

Use `gemup` one of three ways:

### Install with Yarn/NPM

```
yarn add @artsy/gemup
```

## Example usage

### JavaScript

Import into your project:

```javascript
// Note you DO NOT need { } around the import!!
import gemup from "@artsy/gemup";
```

Add an upload function and reference it on an `<input>`:

```javascript
const handleUploadClick = (e) => {
  gemup(e.target.files[0], {
    app: "force",
    geminiHost: 'https://media.artsy.net',
    fail: function (err) {
      console.log("Ouch!", err);
    },
    add: function (src) {
      console.log("We got a data-uri image client-side!", src);
    },
    progress: function (percent) {
      console.log("<3 progress bars, file is this % uploaded: ", percent);
    },
    done: function (src) {
      console.log("Done uploading, here's the S3 url: ", src);
    },
  });
};

...

<input type="file" multiple={false} onChange={(e) => handleUploadClick(e)} />
```

### Using jQuery

Use a file input:

```html
<input id="my-uploader" type="file" multiple="" />
```

Upload some files to S3 when someone changes it.

```js
$("#my-uploader").on("change", function (e) {
  gemup(e.target.files[0], {
    app: "force",
    geminiHost: 'https://media.artsy.net',
    fail: function (err) {
      console.log("Ouch!", err);
    },
    add: function (src) {
      console.log("We got a data-uri image client-side!", src);
    },
    progress: function (percent) {
      console.log("<3 progress bars, file is this % uploaded: ", percent);
    },
    done: function (src) {
      console.log("Done uploading, here's the S3 url: ", src);
    },
  });
});
```

## Notes

Currently only works with jQuery 2.x available globally—but hopefully dropping that dependency down the line.

## License

MIT
