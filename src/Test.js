function runGetCoursesID() {
  console.log(findCourseAndOwner());
};

function getStudents(){
  const courseID = "175154257886";// << Update this
  
  console.log(getStudentDetails(courseID));  
};

function getTopicList(){
  const courseID = "175154257886"; // << Update this
  
  console.log(getTopics(courseID)); 
};