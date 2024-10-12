const mongoose = require('mongoose');

mongoose.connect('mongodb+srv://jace31e:wDw6pChWrGBvDcvx@cluster0.l7s7i.mongodb.net/Cluster0?retryWrites=true&w=majority', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  dbName: 'Cluster0' // Make sure to specify the correct database name
})
.then(() => {
  console.log('Connected to MongoDB');
})
.catch((error) => {
  console.error('Error connecting to MongoDB:', error);
});
