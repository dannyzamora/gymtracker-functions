const firebase = require("firebase")
const functions = require("firebase-functions");

const app = require("express")();
const { db } = require('./util/admin');

const { getAllUserWorkouts, postOneUserWorkout, getWorkout, postSetWorkout, deleteWorkout, deleteSetWorkout, updateSetWorkout } = require('./handlers/userWorkouts')
const { signup, login, uploadImage, addUserDetails, getAuthenticatedUser, getUserDetails } = require('./handlers/users')


const FBAuth = require('./util/fbAuth')

//User Workout routes
app.get("/userWorkouts", getAllUserWorkouts);
app.post("/userWorkout", FBAuth, postOneUserWorkout);
app.get("/userWorkout/:workoutId", FBAuth, getWorkout); // 
app.delete("/userWorkout/:workoutId", FBAuth, deleteWorkout); // 
app.post('/userWorkout/:workoutId/set', FBAuth, postSetWorkout);
app.delete('/userWorkout/sets/:setId', FBAuth, deleteSetWorkout);
app.put('/userWorkout/sets/:setId', FBAuth, updateSetWorkout);



//Progress routes 


// users routes
app.post("/signup", signup);
app.post("/login", login);
app.post('/user/image', FBAuth, uploadImage);
app.post('/user', FBAuth, addUserDetails);
app.get('/user', FBAuth, getAuthenticatedUser);
app.get('/user/:handle', getUserDetails);


exports.api = functions.https.onRequest(app);

exports.onWorkoutDelete = functions
    .firestore.document('/userWorkouts/{workoutId}')
    .onDelete((snapshot, context) => {
        const workoutId = context.params.workoutId;
        const batch = db.batch();
        console.log("it's working", workoutId);

        return db
            .collection('sets')
            .where('workoutId', '==', workoutId)
            .get()
            .then((data) => {

                data.forEach((doc) => {
                    console.log(doc.data())
                    batch.delete(db.doc(`/sets/${doc.id}`))
                });
                return batch.commit();
            })
            .catch(err => console.error(err))
    })

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!");
// });
