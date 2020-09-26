/*******************************************************
 * Logs the Courses in your accounts domain and the owners. 
 *
 * If you have the admin privelages in GSuite Domain, you will 
 * see all users who have classes in your domain.
 *
 * returns : Array containing, course name, id, and owner. 
 */ 
function findCourseAndOwner() {

    const courseList = Classroom.Courses.list().courses;
    
    const courseData = courseList.map(course => {
        let ownerName = Classroom
                    .Courses
                    .Teachers
                    .get(course.id, course.ownerId)
                    .profile
                    .name
                    .fullName

        return `${course.name} : ${course.id} : ${ownerName}`;                                  
    });
  
    return courseData;
};

/*******************************************************
 * Gets a list of alls students in a course.
 *
 * param {string} : course ID taken from findCourseAndOwner()
 *
 * returns : an array of students full name, id and email address.
 */
function getStudentDetails(COURSE_ID){

  const students = Classroom.Courses.Students.list(COURSE_ID).students
  
  return students.map(student => {
                      return `${student.profile.name.fullName}`+ 
                      `: ${student.profile.id} ` +
                      `: ${student.profile.emailAddress}`
                      });
};

/*******************************************************
 *Returns a list of Topics by name and id
 *
 * param {string} : course ID taken from findCourseAndOwner()
 *
 * returns : an array of students full name, id and email address.
 */
function getTopics(COURSE_ID){
  
  const topics = Classroom.Courses.Topics.list(COURSE_ID).topic;
  const topicItems = topics.map(item => `${item.name} : ${item.topicId}`);
                                               
  return topicItems;
 
};

/*******************************************************
 * CREATE A COURESE WORK ITEM AND ADD GRADES
 */

/*******************************************************
 *Simultaneously create a coursework item and add grades to it.
 *
 * In this example, I have put all the global data we gained from our 
 * tests in the first 3 global variables. 
 *
 * You will need to update the Course infor where it says <<< UPDATE THIS
 */
function assignGradesToNewCourseWork(){
  //****GLOBALS*****
  //Update the relevant items here. 
  const COURSE_ID = "175154257886";// <<< UPDATE THIS
  const TOPIC_ID = "";// <<< UPDATE THIS
  const COURSE_INFO = {
    "assigneeMode": "ALL_STUDENTS",
    "associatedWithDeveloper": true,
    "description": "Esta es una tarea automática creada con ClassroomGrades por soporte.tecnico@rds.edu.mx.",// <<< UPDATE THIS
    "maxPoints": 100, // <<< UPDATE THIS
    "state": "PUBLISHED",
    "submissionModificationMode": "SUBMISSION_MODIFICATION_MODE_UNSPECIFIED",
    "title": "Tarea 1 - ClassroomGrades", // <<< UPDATE THIS
    "workType": "ASSIGNMENT", 
    "topicId":TOPIC_ID
  }
  
  
  const COURSEWORK_ID = createCourseWork_(COURSE_ID,COURSE_INFO);
  
  //A 2d array of grades = [[email@email.com,20],[email1@email.com, 18],[ ...etc]];
  const GRADES = importGrades_() //You can import from any sourse. For this, I am just importing from Google Sheets.
  
  GRADES.forEach(student => setGrade_(COURSE_ID,COURSEWORK_ID,student[0],student[1]))
};

//######################################################

/*******************************************************
 * Create a Coursework Item 
 *
 * You can only upload grades for coursework items that have been created
 * in your GAS project.
 */

//######################################################

/*******************************************************
 * Helper functions
 */

/*******************************************************
 * Import Grades from a Google Sheet
 *
 * In this example, I have used a Google Sheet to import grades,
 * however, if you have access to an API from which your grades are
 * derrived, then you might like to use that instead. 
 *
 * You will need to update the variables where it says <<< UPDATE THIS
 *
 * returns : a 2d array of email and grade values. 
 */
function importGrades_(){
  const ss = SpreadsheetApp.openById("1JeFLJdOuu9Xdj5J4gFsQfcrbtIPqK0BXLoLk8bghm6A");// <<< UPDATE THIS
  const sheet = ss.getSheetByName("Grades2Import");// <<< UPDATE THIS
  const range = sheet.getRange(1,1,sheet.getLastRow()-1,2); // <<< UPDATE THIS
  const values = range.getValues();
  return values;
};

/*******************************************************
 * Adds the grade for each available student. 
 *
 * param {string} : COURSE_ID - ID of course.
 * param {string} : COURSEWORK_ID - ID of coursework item. 
 * param {string} : USER_ID - ID of user.
 * param {string} : GRADE - users grade.
 */
function setGrade_(COURSE_ID, COURSEWORK_ID, USER_ID, GRADE){

  try{
    var grades = {  
      'assignedGrade': GRADE,  
      'draftGrade': GRADE  
    } 
    
    const studentSub = Classroom.Courses.CourseWork.StudentSubmissions

    let submissionID = studentSub.list(
      COURSE_ID,
      COURSEWORK_ID,
      {"userId":USER_ID}
    ).studentSubmissions[0].id

    studentSub.patch(
      grades,
      COURSE_ID,
      COURSEWORK_ID,
      submissionID,
      {
        "updateMask":"assignedGrade,draftGrade"  
      }
    );
  }catch(e){
    console.error(e);
    console.log(`${USER_ID} could not be found and was not uploaded.`);
  }
};

/*******************************************************
 * Creates a coruse work item that can be used for grade uploads.
 *
 * param {string} : COURSE_ID - ID of course.
 * param {object} : COURSE_INFO - Object array of data to be entered to created the coursework.
 *
 * return : the id for the course. Can be logged or used directly.  
 */
function createCourseWork_(COURSE_ID,COURSE_INFO){
  
  const newCourseAssignment = Classroom.Courses.CourseWork.create(COURSE_INFO,COURSE_ID);
  
  const courseAssId = newCourseAssignment.id; //Store the newly created ID of the coursework item.
  
  console.log(courseAssId);
  return courseAssId;
};