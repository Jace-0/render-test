// import necessary modules
const express = require('express')
// create an Express app
const app = express()
// const http = require('http')
const morgan = require('morgan')
const cors = require('cors')
const Note = require('./models/note')




app.use(express.static('dist'))
app.use(express.json())
app.use(cors())
// Use Morgan middleware with 'tiny' configuration for logging
app.use(morgan('tiny'))

let notes = [
    {
      id: "1",
      content: "HTML is easy",
      important: true
    },
    {
      id: "2",
      content: "Browser can execute only JavaScript",
      important: false
    },
    {
      id: "3",
      content: "GET and POST are the most important methods of HTTP protocol",
      important: true
    }
  ]


const requestLogger = (request, response, next) => {
    console.log('Method:', request.method)
    console.log('Path:  ', request.path)
    console.log('Body:  ', request.body)
    console.log('---')
    next()
  }
  
app.use(express.json())
app.use(requestLogger)


const unknownEndPoint = (request, response) => {
    response.status(404).send({error: 'unknown endpoint'})
}

const generateId = () => {
    const maxId = notes.length > 0
      ? Math.max(...notes.map(n => Number(n.id)))
      : 0
    console.log(Math.max(...notes.map(n => Number(n.id))))      
    return String(maxId + 1)
  }

app.post('/api/notes', (request, response, next) => {
    const body = request.body

    if (!body.content) {
        return response.status(400).json({
            error: 'content-missing'
        })
    }

    // Create a new Note object with data from the request body
    const note = new Note({
        content: body.content, 
        important : Boolean(body.important) || false,
    })
    
    // Save the new note to the database
    note.save().then(savedNote =>{ // When the save operation completes successfully...
      response.json(savedNote) // Send the saved note as a JSON response to the client
    })
    .catch(error => next(error))

    // notes = notes.concat(note)
    // // console.log(note)
    // response.json(note)
})


app.get('/api/notes', (request, response) => {
  Note.find({}).then(notes =>{
    response.json(notes)
  })
})


app.get('/api/notes/:id', (request, response, next) => {
    Note.findById(request.params.id).then(note => {
      if (note) {
          response.json(note)
      } else {
          response.status(404).end()
      }
    })
    // .catch(error => {
    //   // console.log(error)
    //   response.status(400).send({ error: 'malformatted id' })
    // })
    // .catch(error => {
    //   console.log(error)
    //   response.status(500).end()
    // })

    // it it some but there are cases where it is better to implement all error handling in a single place
    .catch(error => next(error))
  })

    // const id = request.params.id
    // const note = notes.find(note => note.id === id)




// app.get('/jace-0', (request, response) => {
//     response.send('<h1>Software Developer</h1>')
// })
app.put('/api/notes/:id', (request, response, next) => {
  const {content, important} = request.body
  // console.log(body)
  const note = {
    content: body.content,
    important: body.important,
  }

  Note.findByIdAndUpdate(request.params.id, 
    {content, important},
    { new: true, runValidators: true, context: 'query' })
    .then(updatedNote => {
      response.json(updatedNote)
    })
    .catch(error => next(error))
})

app.delete('/api/notes/:id', (request, response, next) => {
    Note.findByIdAndDelete(request.params.id)
      .then(result => {
        response.status(204).end()
      })
      .catch(error => next(error))
    // const id = request.params.id
    // notes = notes.filter(note => note.id !== id)
    // response.status(204).end()

})

// const app = http.createServer((request, response) => {
//   response.writeHead(200, { 'Content-Type': 'application/json' })
//   response.end(JSON.stringify(notes))
// })


// This middleware will be used for catching requests made to non-existent routes. For these requests, the middleware will return an error message in the JSON format.



// Express error Handler
const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({error: error.message})
  }

  next(error)
}

// this has to be the last loaded middleware, also all the routes should be registered before this!
app.use(errorHandler)

app.use(unknownEndPoint)

const PORT =  process.env.PORT
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})