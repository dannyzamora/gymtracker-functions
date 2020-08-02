const { db, admin } = require('../util/admin')

exports.getAllUserWorkouts = (req, res) => {
    db
        .collection("userWorkouts")
        .orderBy("createdAt", "desc")
        .get()
        .then((data) => {
            let workouts = [];
            data.forEach((doc) => {
                workouts.push({
                    workoutId: doc.id,
                    ...doc.data(),
                });
            });
            return res.json(workouts);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).json({ error: err.code });
        });
}
exports.getWorkout = (req, res) => {
    let workoutData = {};
    db.doc(`/userWorkouts/${req.params.workoutId}`)
        .get()
        .then((doc) => {
            if (!doc.exists) {
                return res.status(404).json({ error: 'Workout not found' });
            }
            if (doc.data().userHandle !== req.user.handle) {
                return res.status(401).json({ error: 'Unauthorized' });
            }
            workoutData = doc.data();
            workoutData.workoutId = doc.id;
            return db
                .collection('sets')
                .orderBy("createdAt", "asc")
                .where('workoutId', '==', req.params.workoutId)
                .get();
        })
        .then((data) => {
            workoutData.sets = [];
            data.forEach((doc) => {
                workoutData.sets.push(doc.data());
            });
            return res.json(workoutData);
        })
        .catch((err) => {

            console.error(err);
            if (res.headerSent) {
                res.status(500).json({ error: err.code });
            }
        });
};

exports.deleteWorkout = (req, res) => {
    const document = db.doc(`/userWorkouts/${req.params.workoutId}`);
    document
        .get()
        .then((doc) => {
            if (!doc.exists) {
                throw new Object({ status: 404, err: "Workout not found" });

            }
            if (doc.data().userHandle !== req.user.handle) {
                return res.status(403).json({ error: "Unauthorized" });
            } else {
                return document.delete();
            }
        })
        .then(() => {
            res.json({ message: "Workout deleted successfully" });
        })
        .catch(({ status = 500, err = "Something went wrong" }) => {
            console.log(err);
            res.status(status).json({ error: err });
        });
};

exports.postSetWorkout = (req, res) => {
    if (typeof (req.body.reps) !== "number")
        return res.status(400).json({ reps: "Must be a number" });
    if (typeof (req.body.weight) !== "number")
        return res.status(400).json({ weight: "Must be a number" });

    const newSet = {
        ...req.body,//reps,weight
        createdAt: new Date().toISOString(),
        workoutId: req.params.workoutId,
        userHandle: req.user.handle,
    };
    console.log(newSet);

    db.doc(`/userWorkouts/${req.params.workoutId}`)
        .get()
        .then((doc) => {
            if (!doc.exists) {
                // res.status(404).json({ error: "Workout not found" });
                throw new Object({ status: 404, err: "Workout not found" });

            }
            return doc.ref.update({ setCount: doc.data().setCount + 1 });
        })
        .then(() => {
            return db.collection("sets").add(newSet);
        })
        .then(() => {
            res.json(newSet);

        })
        .catch(({ status = 500, err = "Something went wrong" }) => {
            console.log(err);
            res.status(status).json({ error: err });
        });
};

exports.updateSetWorkout = (req, res) => {
    if (typeof (req.body.reps) !== "number")
        return res.status(400).json({ comment: "Must be a number" });
    if (typeof (req.body.weight) !== "number")
        return res.status(400).json({ comment: "Must be a number" });

    const setDetails = req.body;
    db.doc(`/sets/${req.params.setId}`)
        .update(setDetails)
        .then(() => {
            return res.json({ message: "Set updated successfully" });
        })
        .catch((err) => {
            console.error(err);
            return res.status(500).json({ error: err.code });
        });;


}

exports.deleteSetWorkout = (req, res) => {
    const document = db.doc(`/sets/${req.params.setId}`);

    document
        .get()
        .then((doc) => {
            if (!doc.exists) {
                throw new Object({ status: 404, err: "set not found" });

            }
            if (doc.data().userHandle !== req.user.handle) {
                return res.status(403).json({ error: "Unauthorized" });
            } else {
                return db.doc(`/userWorkouts/${doc.data().workoutId}`).get()
            }
        })
        .then(doc => {
            doc.ref.update({ setCount: doc.data().setCount - 1 })
        })
        .then(() => {
            return document.delete()
        })
        .then(() => {
            res.json({ message: "set deleted successfully" });
        })
        .catch(({ status = 500, err = "Something went wrong" }) => {
            console.log(err);
            res.status(status).json({ error: err });
        });
};

exports.postOneUserWorkout = (req, res) => {
    if (req.body.name.trim() === "") {
        return res.status(400).json({ name: "Name must not be empty" });
    }
    const newWorkout = {
        ...req.body,
        userHandle: req.user.handle,
        createdAt: req.body.createdAt ? new Date(req.body.createdAt).getTime() : new Date().getTime(),
        setCount: 0,

    };

    db
        .collection("userWorkouts")
        .add(newWorkout)
        .then((doc) => {
            const resWorkout = newWorkout;
            resWorkout.workoutId = doc.id;
            res.json(resWorkout);
        })
        .catch((err) => {
            res.status(500).json({ error: "Somthing went wrong" });
            console.log(err);
        });
}