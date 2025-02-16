import React from 'react';

const Profile = () => {
  const user = {
    name: 'John Doe',
    profilePicture: 'https://via.placeholder.com/150',
    questionsSolved: 45,
    experienceLevel: 'Intermediate',
  };

  return (
    <div className="profile-section">
      {/* <img src={user.profilePicture} alt="Profile" className="profile-picture" /> */}
      <h2>{user.name}</h2>
      <p>Questions Solved: {user.questionsSolved}</p>
      <p>Experience Level: {user.experienceLevel}</p>
    </div>
  );
};

export default Profile;