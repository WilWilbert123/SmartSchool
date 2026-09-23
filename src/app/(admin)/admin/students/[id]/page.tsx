import { getStudentById } from "@/features/students/student.actions";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, GraduationCap, Edit, UserCircle, Save, Mail, Phone, MapPin, Calendar, Hash } from "lucide-react";
import { format } from "date-fns";

export default async function StudentProfilePage({ params }: { params: { id: string } }) {
  const { data: student, error } = await getStudentById(params.id);

  if (error || !student) {
    notFound();
  }

  const person = student.person;
  const fullName = `${person?.first_name} ${person?.middle_name || ''} ${person?.last_name} ${person?.suffix || ''}`.trim();

  return (
    <div className="space-y-6 pb-12">
      {/* Header and Back Link */}
      <div>
        <Link href="/admin/students" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary transition-colors mb-4">
          <ChevronLeft className="mr-1 h-4 w-4" />
          Back to Students
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center overflow-hidden border-2 border-background shadow-sm">
              {person?.profile_photo_url ? (
                <img src={person.profile_photo_url} alt={fullName} className="h-full w-full object-cover" />
              ) : (
                <UserCircle className="h-8 w-8 text-primary" />
              )}
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">{fullName}</h1>
              <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                <span className="flex items-center"><Hash className="h-3.5 w-3.5 mr-1" />{student.student_number}</span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-green-500/10 text-green-600 uppercase">
                  {student.current_status}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="inline-flex items-center justify-center rounded-xl text-sm font-medium h-10 px-4 border border-input bg-background hover:bg-accent text-foreground transition-colors shadow-sm">
              <Edit className="mr-2 h-4 w-4" />
              Edit Profile
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column - Main Info */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-card border rounded-2xl shadow-sm overflow-hidden">
            <div className="p-5 border-b bg-muted/20">
              <h2 className="font-semibold text-lg flex items-center">
                <UserCircle className="mr-2 h-5 w-5 text-muted-foreground" />
                Personal Information
              </h2>
            </div>
            <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-8">
              <div>
                <dt className="text-sm font-medium text-muted-foreground mb-1">Full Name</dt>
                <dd className="text-sm font-medium">{fullName}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground mb-1">Date of Birth</dt>
                <dd className="text-sm font-medium">
                  {person?.birth_date ? format(new Date(person.birth_date), 'MMMM d, yyyy') : 'Not specified'}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground mb-1">Gender</dt>
                <dd className="text-sm font-medium capitalize">{person?.gender?.toLowerCase() || 'Not specified'}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground mb-1">Contact Number</dt>
                <dd className="text-sm font-medium flex items-center">
                  {person?.contact_number || 'Not specified'}
                </dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-sm font-medium text-muted-foreground mb-1">Address</dt>
                <dd className="text-sm font-medium flex items-center">
                  {person?.address || 'Not specified'}
                </dd>
              </div>
            </div>
          </div>

          <div className="bg-card border rounded-2xl shadow-sm overflow-hidden">
            <div className="p-5 border-b bg-muted/20">
              <h2 className="font-semibold text-lg flex items-center">
                <GraduationCap className="mr-2 h-5 w-5 text-muted-foreground" />
                Academic Information
              </h2>
            </div>
            <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-8">
              <div>
                <dt className="text-sm font-medium text-muted-foreground mb-1">Student Number</dt>
                <dd className="text-sm font-medium">{student.student_number}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground mb-1">Admission Date</dt>
                <dd className="text-sm font-medium">
                  {student.admission_date ? format(new Date(student.admission_date), 'MMMM d, yyyy') : 'Not specified'}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground mb-1">Current Status</dt>
                <dd className="text-sm font-medium capitalize">{student.current_status.toLowerCase()}</dd>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Guardian & Quick Links */}
        <div className="space-y-6">
          <div className="bg-card border rounded-2xl shadow-sm overflow-hidden">
            <div className="p-5 border-b bg-muted/20">
              <h2 className="font-semibold text-lg">Guardian Information</h2>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <dt className="text-sm font-medium text-muted-foreground mb-1">Guardian Name</dt>
                <dd className="text-sm font-medium">{student.guardian_name || 'Not specified'}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground mb-1">Guardian Contact</dt>
                <dd className="text-sm font-medium">{student.guardian_contact || 'Not specified'}</dd>
              </div>
            </div>
          </div>
          
          <div className="bg-card border rounded-2xl shadow-sm overflow-hidden">
            <div className="p-5 border-b bg-muted/20">
              <h2 className="font-semibold text-lg">Quick Actions</h2>
            </div>
            <div className="p-3">
              <button className="w-full justify-start inline-flex items-center rounded-xl text-sm font-medium h-10 px-4 hover:bg-muted transition-colors text-left">
                View Academic Record
              </button>
              <button className="w-full justify-start inline-flex items-center rounded-xl text-sm font-medium h-10 px-4 hover:bg-muted transition-colors text-left">
                Generate Student ID
              </button>
              <button className="w-full justify-start inline-flex items-center rounded-xl text-sm font-medium h-10 px-4 hover:bg-destructive/10 text-destructive transition-colors text-left mt-2 border border-transparent hover:border-destructive/20">
                Deactivate Account
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
