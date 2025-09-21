import { motion } from "motion/react";
import { useState } from "react";
import { ArrowLeft, Camera, MapPin, Calendar, Shield, Award, TrendingUp, Users } from "lucide-react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Badge } from "./ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Separator } from "./ui/separator";
import { Progress } from "./ui/progress";
import { useAuth } from "./AuthWrapper";

interface ProfilePageProps {
  onBack: () => void;
}

export function ProfilePage({ onBack }: ProfilePageProps) {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({
    firstName: "John",
    lastName: "Doe",
    email: user?.email || "john.doe@example.com",
    phone: "+1 (555) 123-4567",
    location: "Lagos, Nigeria",
    bio: "Crypto enthusiast and fintech professional. Building the future of money.",
    website: "https://johndoe.dev",
    company: "AnyPay Technologies",
    joinedDate: "March 2024",
  });

  const stats = [
    { label: "Total Transactions", value: "1,247", icon: TrendingUp, color: "text-blue-600" },
    { label: "Volume Traded", value: "$124,750", icon: TrendingUp, color: "text-green-600" },
    { label: "Referrals", value: "23", icon: Users, color: "text-purple-600" },
    { label: "Trust Score", value: "98%", icon: Shield, color: "text-yellow-600" },
  ];

  const achievements = [
    { name: "First Transaction", description: "Completed your first value transfer", earned: true },
    { name: "Volume Milestone", description: "Transferred over $10,000 in value", earned: true },
    { name: "Referral Expert", description: "Referred 10+ users to AnyPay", earned: true },
    { name: "Global Trader", description: "Traded in 5+ different currencies", earned: false },
    { name: "Early Adopter", description: "Joined AnyPay in the beta phase", earned: true },
    { name: "Power User", description: "Completed 1000+ transactions", earned: false },
  ];

  const recentActivity = [
    { type: "transaction", description: "Converted $500 USD to NGN", time: "2 hours ago", status: "completed" },
    { type: "referral", description: "Sarah Johnson joined via your referral", time: "1 day ago", status: "success" },
    { type: "achievement", description: "Earned 'Volume Milestone' badge", time: "3 days ago", status: "success" },
    { type: "transaction", description: "Sent 0.01 BTC to wallet", time: "5 days ago", status: "completed" },
  ];

  const handleSave = () => {
    // Here you would save the profile data
    setIsEditing(false);
  };

  return (
    <motion.div
      initial={{ x: 100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: -100, opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen bg-gray-50 p-6"
    >
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onBack}
            className="rounded-full"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
            <p className="text-gray-600">Manage your AnyPay profile and view your activity</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Info Card */}
            <Card className="p-6">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <Avatar className="w-20 h-20">
                      <AvatarImage src="/api/placeholder/80/80" alt="Profile" />
                      <AvatarFallback className="text-xl font-bold bg-gradient-to-r from-blue-800 to-purple-600 text-white">
                        {profile.firstName[0]}{profile.lastName[0]}
                      </AvatarFallback>
                    </Avatar>
                    <Button 
                      size="icon" 
                      className="absolute -bottom-2 -right-2 rounded-full w-8 h-8 bg-blue-600 hover:bg-blue-700"
                    >
                      <Camera className="w-4 h-4" />
                    </Button>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{profile.firstName} {profile.lastName}</h2>
                    <p className="text-gray-600">{profile.email}</p>
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {profile.location}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        Joined {profile.joinedDate}
                      </div>
                    </div>
                  </div>
                </div>
                <Button 
                  variant={isEditing ? "default" : "outline"}
                  onClick={isEditing ? handleSave : () => setIsEditing(true)}
                >
                  {isEditing ? "Save Changes" : "Edit Profile"}
                </Button>
              </div>

              {isEditing ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      value={profile.firstName}
                      onChange={(e) => setProfile({...profile, firstName: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      value={profile.lastName}
                      onChange={(e) => setProfile({...profile, lastName: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      value={profile.phone}
                      onChange={(e) => setProfile({...profile, phone: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      value={profile.location}
                      onChange={(e) => setProfile({...profile, location: e.target.value})}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="bio">Bio</Label>
                    <Input
                      id="bio"
                      value={profile.bio}
                      onChange={(e) => setProfile({...profile, bio: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="website">Website</Label>
                    <Input
                      id="website"
                      value={profile.website}
                      onChange={(e) => setProfile({...profile, website: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="company">Company</Label>
                    <Input
                      id="company"
                      value={profile.company}
                      onChange={(e) => setProfile({...profile, company: e.target.value})}
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-gray-700">{profile.bio}</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-900">Phone:</span>
                      <span className="ml-2 text-gray-600">{profile.phone}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-900">Website:</span>
                      <span className="ml-2 text-blue-600">{profile.website}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-900">Company:</span>
                      <span className="ml-2 text-gray-600">{profile.company}</span>
                    </div>
                  </div>
                </div>
              )}
            </Card>

            {/* Stats */}
            <Card className="p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Account Statistics</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {stats.map((stat, index) => (
                  <motion.div
                    key={stat.label}
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className="text-center p-4 rounded-lg bg-gray-50"
                  >
                    <stat.icon className={`w-6 h-6 mx-auto mb-2 ${stat.color}`} />
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    <p className="text-sm text-gray-600">{stat.label}</p>
                  </motion.div>
                ))}
              </div>
            </Card>

            {/* Recent Activity */}
            <Card className="p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Recent Activity</h3>
              <div className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <motion.div
                    key={index}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center gap-4 p-3 rounded-lg bg-gray-50"
                  >
                    <div className={`w-2 h-2 rounded-full ${
                      activity.status === 'completed' ? 'bg-green-500' :
                      activity.status === 'success' ? 'bg-blue-500' : 'bg-gray-400'
                    }`} />
                    <div className="flex-1">
                      <p className="text-gray-900">{activity.description}</p>
                      <p className="text-sm text-gray-500">{activity.time}</p>
                    </div>
                    <Badge variant={activity.status === 'completed' ? 'default' : 'secondary'}>
                      {activity.status}
                    </Badge>
                  </motion.div>
                ))}
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Trust Score */}
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <Shield className="w-6 h-6 text-green-600" />
                <h3 className="text-lg font-semibold text-gray-900">Trust Score</h3>
              </div>
              <div className="text-center mb-4">
                <div className="text-3xl font-bold text-green-600 mb-2">98%</div>
                <Progress value={98} className="w-full h-2" />
                <p className="text-sm text-gray-500 mt-2">Excellent standing</p>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Identity Verified</span>
                  <Badge className="bg-green-100 text-green-800">✓</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Phone Verified</span>
                  <Badge className="bg-green-100 text-green-800">✓</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Email Verified</span>
                  <Badge className="bg-green-100 text-green-800">✓</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">2FA Enabled</span>
                  <Badge className="bg-green-100 text-green-800">✓</Badge>
                </div>
              </div>
            </Card>

            {/* Achievements */}
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <Award className="w-6 h-6 text-yellow-600" />
                <h3 className="text-lg font-semibold text-gray-900">Achievements</h3>
              </div>
              <div className="space-y-3">
                {achievements.map((achievement, index) => (
                  <motion.div
                    key={achievement.name}
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className={`p-3 rounded-lg border ${
                      achievement.earned 
                        ? 'bg-yellow-50 border-yellow-200' 
                        : 'bg-gray-50 border-gray-200 opacity-50'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <div className={`w-3 h-3 rounded-full ${
                        achievement.earned ? 'bg-yellow-500' : 'bg-gray-300'
                      }`} />
                      <span className="font-medium text-gray-900">{achievement.name}</span>
                    </div>
                    <p className="text-sm text-gray-600 pl-5">{achievement.description}</p>
                  </motion.div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </motion.div>
  );
}