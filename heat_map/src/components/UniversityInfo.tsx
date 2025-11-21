import React from 'react';
import { Calendar, Users, Award, BookOpen, MapPin, Trophy } from 'lucide-react';

interface Milestone {
  year: number;
  event: string;
}

interface UniversityData {
  foundedYear?: number;
  currentYear?: number;
  name?: string;
  location?: string;
  studentCount?: string;
  facultyCount?: string;
  departments?: number;
  achievements?: string[];
  description?: string;
  milestones?: Milestone[];
}

interface UniversityInfoProps {
  data?: UniversityData;
  className?: string;
  layout?: 'default' | 'compact' | 'grid';
}

const UniversityInfo: React.FC<UniversityInfoProps> = ({ 
  data = {},
  className = '',
  layout = 'default'
}) => {
  const defaultData: UniversityData = {
    foundedYear: 1950,
    currentYear: new Date().getFullYear(),
    name: 'University of Excellence',
    location: 'Academic City',
    studentCount: '25,000+',
    facultyCount: '1,500+',
    departments: 15,
    achievements: [
      'Top 100 Global University',
      'Excellence in Research',
      'Outstanding Alumni Network',
      'Innovation Hub'
    ],
    description: 'For 75 years, our university has been a beacon of academic excellence, innovation, and social impact. We continue to shape leaders and innovators who make a difference in the world.',
    milestones: [
      { year: 1950, event: 'University Founded' },
      { year: 1975, event: '25th Anniversary - First International Partnership' },
      { year: 2000, event: '50th Anniversary - Digital Campus Launch' },
      { year: 2025, event: '75th Anniversary - Global Excellence Recognition' }
    ]
  };

  const info = { ...defaultData, ...data };
  const yearsOfExcellence = (info.currentYear || 0) - (info.foundedYear || 0);

  const renderStats = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
      <div className="bg-white p-8 rounded-xl text-center shadow-md transition-transform duration-300 hover:-translate-y-1">
        <Calendar className="text-blue-500 mb-4 mx-auto" size={32} />
        <div className="text-4xl font-bold text-slate-800 mb-2">{yearsOfExcellence}</div>
        <div className="text-gray-500 text-base">Years of Excellence</div>
      </div>
      <div className="bg-white p-8 rounded-xl text-center shadow-md transition-transform duration-300 hover:-translate-y-1">
        <Users className="text-blue-500 mb-4 mx-auto" size={32} />
        <div className="text-4xl font-bold text-slate-800 mb-2">{info.studentCount}</div>
        <div className="text-gray-500 text-base">Students</div>
      </div>
      <div className="bg-white p-8 rounded-xl text-center shadow-md transition-transform duration-300 hover:-translate-y-1">
        <BookOpen className="text-blue-500 mb-4 mx-auto" size={32} />
        <div className="text-4xl font-bold text-slate-800 mb-2">{info.facultyCount}</div>
        <div className="text-gray-500 text-base">Faculty Members</div>
      </div>
      <div className="bg-white p-8 rounded-xl text-center shadow-md transition-transform duration-300 hover:-translate-y-1">
        <Award className="text-blue-500 mb-4 mx-auto" size={32} />
        <div className="text-4xl font-bold text-slate-800 mb-2">{info.departments}</div>
        <div className="text-gray-500 text-base">Faculties</div>
      </div>
    </div>
  );

  const renderMilestones = () => (
    <div className="h-full">
      <h3 className="text-2xl font-bold text-slate-800 mb-6">Our Journey</h3>
      <div className="relative">
        {info.milestones?.map((milestone, index) => (
          <div key={index} className="flex items-center mb-6 pl-8 relative">
            <div className="font-bold text-blue-500 min-w-[60px] mr-4">{milestone.year}</div>
            <div className="text-gray-700 flex-1">{milestone.event}</div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderAchievements = () => (
    <div className="h-full">
      <h3 className="text-2xl font-bold text-slate-800 mb-6">Our Achievements</h3>
      <div className="flex flex-col gap-4">
        {info.achievements?.map((achievement, index) => (
          <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <Trophy className="text-orange-500 min-w-[20px]" size={20} />
            <span className="text-gray-700">{achievement}</span>
          </div>
        ))}
      </div>
    </div>
  );

  if (layout === 'compact') {
    return (
      <div className={`p-8 bg-white rounded-xl shadow-md ${className}`}>
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-slate-800 mb-2">{info.name}</h2>
          <div className="flex items-center gap-2 text-gray-500 text-sm">
            <MapPin size={16} />
            <span>{info.location}</span>
          </div>
        </div>
        {renderStats()}
      </div>
    );
  }

  return (
    <div className={`py-16 px-8 bg-gray-50 min-h-screen ${className}`}>
      <div className="text-center mb-12">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold text-slate-800 mb-4 md:text-3xl">About {info.name}</h2>
          <div className="flex items-center justify-center gap-2 text-gray-500 text-lg">
            <MapPin className="text-red-500" size={20} />
            <span>{info.location}</span>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-xl leading-relaxed text-gray-700 max-w-4xl mx-auto">{info.description}</p>
        </div>

        {renderStats()}
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="bg-white p-8 rounded-xl shadow-md">
            {renderMilestones()}
          </div>
          <div className="bg-white p-8 rounded-xl shadow-md">
            {renderAchievements()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UniversityInfo;
