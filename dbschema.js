let db = {
  workouts: [
    {
      name: req.body.name,
      muscle: req.body.muscle,
      user: req.body.user,
      createdAt: new Date().toISOString(),
    },
  ],
  comments: [
    {
      userHandle: 'user',
      workoutId: 'kdjsfgdksuufhgkdsufky',
      reps: 2,
      weight: 135,

    }
  ],
  muscle: [
    {
      name: "chest",
    },
  ],
};
