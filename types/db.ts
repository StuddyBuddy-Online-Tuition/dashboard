import type { StudentMode } from "./student";
import type { Weekday } from "./timeslot";

export type DbStudent = {
  id: string;
  studentid: string;
  name: string;
  parentname: string | null;
  studentphone: string | null;
  parentphone: string | null;
  email: string | null;
  school: string | null;
  grade: string | null;
  status: string;
  classinid: string | null;
  registereddate: string | null; // date
  modes: StudentMode[] | null;
  dlp: string;
  full_name: string | null;
  ticketid: string | null;
};

export type DbSubject = {
  code: string;
  name: string;
  standard: string;
  type: string;
  subject: string;
};

export type DbTimeslot = {
  timeslotid: string;
  subjectcode: string;
  day: Weekday; // matches DB enum weekday
  starttime: string; // time
  endtime: string; // time
  teachername: string;
  studentid: string | null;
  studentname: string | null;
};

export type DbStudentSubject = {
  studentid: string;
  subjectcode: string;
  createdat: string | null;
  updatedat: string | null;
};

export type DbUser = {
  id: string;
  name: string;
  email: string;
  role: string;
  createdat: string | null;
  updatedat: string | null;
  password: string | null;
};

