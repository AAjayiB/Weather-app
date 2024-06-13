const { createApp } = Vue 
 
  createApp({ 
    data() { 
      return { 
        city:"", 
        code:"", 
        color: true, 
        cityData:null, 
        dataPer3Hours:null, 
        day1:[], 
        day2:[], 
        day3:[], 
        day4:[], 
        day5:[], 
        showModal: false, 
        modalData:[], 
        showData: false, 
        days:["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", 
"Friday", "Saturday"], 
        averageAirPollution:[], 
        pollutionDay:null, 
        getError:false, 
        errorMsg:"", 
        questions:[], 
        showQuestions: false, 
        questionIndex:0, 
        showQuizResults:false, 
        correctGuesses:0, 
        selectedAnswer:null, 
                
      } 
    }, 
    methods: { 
      // Puts the weather data into different arrays based on the day 
      organizeData(day,data){ 
        let notEndOfDay=true 
        while(notEndOfDay){ 
          day.push(data.shift()) 
          if(data==null || data[0]?.dt_txt.slice(11,19) == "00:00:00"){ 
            notEndOfDay = false 
          } 
        } 
      }, 
      // Gets all the data needed for the forecast 
      async getCityData(){ 
        // hides already existing data from the client upon search 
        this.getError=false 
        this.showData=false 
        this.showQuestions=false 
        let status; 
        // Get requests 
        let weatherData = await 
fetch(`http://localhost:3000/${this.code}/${this.city}`).then( res => { 
          status = res.status 
          return res.json() 
        }) 
        let airPollutionData = await 
fetch(`http://localhost:3000/airpollution/${this.code}/${this.city}`).then(res=>{ 
          return res.json() 
        }) 
        // Checks if the get request was successfull and returns results based on that 
        if(status === 200){ 
          this.dataPer3Hours = weatherData.list 
          this.organizeData(this.day1,this.dataPer3Hours) 
          this.organizeData(this.day2,this.dataPer3Hours)  
          this.organizeData(this.day3,this.dataPer3Hours) 
          this.organizeData(this.day4,this.dataPer3Hours) 
          this.organizeData(this.day5,this.dataPer3Hours) 
          this.calcAverageAirPolltion(this.averageAirPollution, 
airPollutionData.list) 
          this.showData=true 
        } 
        else if(status === 400) { 
          this.getError=true 
          this.errorMsg=weatherData 
          console.log(this.errorMsg) 
        } 
         
      }, 
      // shows the modal displays the data passed true 
      toggleModalOn(data,index){ 
        this.modalData=data 
        this.pollutionDay=index 
        this.showModal=true 
         
      }, 
      // Hides the modal and clears the data in it 
      toggleModalOff(){ 
         
        this.showModal=false 
        this.modalData=[] 
      }, 
      // Takes a list of weather information for the day  
      // and gets the average temperature 
      averageTemp(listV){ 
        let average=0; 
        for(i =0;i<listV.length;i++){ 
          average+=listV[i].main.temp 
        } 
        return average/=listV.length 
      }, 
      // Takes a list of weather information for the day  
      // and returns the average wind speed 
      averageWindSpeed(listV){ 
        let average=0; 
        for(i =0;i<listV.length;i++){ 
          average+=listV[i].wind.speed 
        } 
        return average/=listV.length 
      }, 
      // Takes a list of weather information for the day 
      // and returns the total rainfall level 
      dailyRainfallLevel(listV){ 
        let total=0; 
        for(i =0;i<listV.length;i++){ 
          if(listV[i].rain){ 
            total+=listV[i].rain["3h"] 
          } 
           
        } 
        return total 
      }, 
      // Takes a list of air pollution information,  
      // calculates the daily average, 
      // puts each one into different an array   
      calcAverageAirPolltion(list,data){ 
        let sum = 0; 
        let denominator = 0; 
        let currentDay = new Date(data[0].dt*1000).getDay() 
        for(i=0; i<data.length;i++){ 
          sum += data[i].components.pm2_5 
          denominator++ 
          if(i==data.length-1 ||currentDay != new 
Date(data[i].dt*1000).getDay()){ 
            list.push(sum/denominator) 
            sum=0 
            denominator=0 
            currentDay = new Date(data[i].dt*1000).getDay() 
          } 
        } 
      }, 
      // Returns a tip based on the temperature 
      temperatureTip(temp){ 
        if(temp < 13){ 
          return "Pack for cold weather." 
        } 
        else if(temp>=13 && temp <23){ 
          return "Pack for mild weather." 
        } 
        else{ 
          return "Pack for hot weather." 
        } 
      }, 
      // Returns a tip based on whether it rains or not 
      rainTip(rainfall){ 
        if(rainfall){ 
          return "Pack an umbrella." 
        } 
        else return "Dry spells today!" 
      }, 
      // Returns a tip based on the level of air pollution 
      airPollutionTip(airPollution){ 
        if(airPollution>10){ 
          return "Wear a mask, air is not clean today." 
        } 
        else return "Clean air today no need for masks!" 
      }, 
      // fetches the list of questions from the api 
      async getQuestions(){ 
          const questions = await fetch('http://localhost:3000/quiz').then(res=>{ 
            return res.json() 
          }) 
          this.questions=questions.results 
      }, 
      toggleQuestions(){ 
        this.showQuizResults=false 
        this.showData=false 
        this.showModal=false 
        this.correctGuesses=0 
        this.questionIndex=0 
        this.getQuestions() 
        this.showQuestions=!this.showQuestions 
         
      }, 
      // Returns the index for the question 
      questionNumber(){ 
        return this.questionIndex 
      }, 
      // Checks if the selected answer was correct and increments the correctGuesses counter 
      // Increments the question index to move to the next question  
      // when the questionIndex counter reaches 9 then reveals the results 
      incrementQuestionNumber(){ 
        //Error checking 
        // console.log(this.selectedAnswer) 
        // console.log(this.questions[this.questionIndex].correct_answer) 
        if(this.selectedAnswer==this.questions[this.questionIndex].correct_answer){ 
           
          this.correctGuesses++ 
        } 
        if(this.questionIndex<9){ 
           this.questionIndex++ 
        } 
        else{this.showQuizResults=true} 
      } 
    }, 
  }).mount('#app') 