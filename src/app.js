const express = require('express')
const path = require('path');
const router = express.Router();



const app = express()
app.use('/', router);
const port = 3000

router.get('/pub', (req, res) => {
    res.status(200).send(req.headers)
})

app.get('/:name', function (req, res, next) {
    var options = {
      root: path.join(__dirname, 'public')
    }
    var fileName = req.params.name || "index.html"
    res.sendFile(fileName, options, function (err) {
      if (err) {
        next(err)
      } else {
        console.log('Sent:', fileName)
      }
    })
  })

app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`))