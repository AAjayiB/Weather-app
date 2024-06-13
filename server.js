const Axios = require('axios')
const express = require('express')
const cors = require('cors')
require('dotenv').config()
const app = express()
app.use(cors())
const path=require("path")
let htmlPath= path.resolve(__dirname,"index.html")
let cssPath= path.resolve(__dirname,"public")
app.use(express.static(cssPath))
const port = 3000
const apikey = process.env.WEATHER_API_KEY

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})

app.get('/', (req, res) => {
  res.sendFile(htmlPath);
});

app.get('/:code/:city', getCity )

app.get('/airpollution/:code/:city',getAirPollution)

app.get('/quiz', getQuestions)

async function  getCity(req, res){

  console.log(req.params)
  const coord = await Axios.get(`http://api.openweathermap.org/geo/1.0/direct?q=${req.params.city},${req.params.code}&limit=5&appid=${apikey}`)
  console.log(coord)
  if(coord.data[0]!=null){
    const weatherData = await Axios.get(`http://api.openweathermap.org/data/2.5/forecast?lat=${coord.data[0].lat}&lon=${coord.data[0].lon}&appid=${apikey}&units=metric`)
    res.send(weatherData.data)
  }
  else res.status(400).json(`The city ${req.params.city} does not exist`)
  
}

async function getAirPollution(req, res) {

  let coord = await Axios.get(`http://api.openweathermap.org/geo/1.0/direct?q=${req.params.city},${req.params.code}&limit=5&appid=${apikey}`)
  if(coord.data[0]!=null){  
    let airPollData= await Axios.get(`http://api.openweathermap.org/data/2.5/air_pollution/forecast?lat=${coord.data[0].lat}&lon=${coord.data[0].lon}&appid=${apikey}`)
    res.send(airPollData.data)
  }
  else res.status(400).json(`The city ${req.params.city} does not exist`)
}

async function getQuestions(req, res) {
  let questions = await Axios.get('https://opentdb.com/api.php?amount=10&category=9&type=multiple')
  res.send(questions.data)
}


