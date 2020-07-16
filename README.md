# gemup

Lightweight Javascript utility for using Artsy's Gemini service to upload directly to S3. Used internally at Artsy, so not useful to general public—but open source by default!

## Example

Install with Yarn/NPM:

```
yarn add @artsy/gemup
```

Import into your project:

```javascript
// Note you DO NOT need { } around the import!!
import gemup from "@artsy/gemup";
```

Add an upload function and reference it on an `<input>`:

```jsx
const handleUploadClick = (e) => {
  gemup(e.target.files[0], {
    app: "force",
    key: "SECRET_GEMINI_S3_KEY",
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
```

...

```jsx
<input type="file" multiple={false} onChange={(e) => handleUploadClick(e)} />
```

## Notes

Currently only works with jQuery 2.x available globally—but hopefully dropping that dependency down the line.

## License

MIT
