fetch('http://localhost:3000/pub', {
    headers: {
        'accept-language': "fr"
      }
})
  .then(response => response.json())
  .then(data => console.log(data));