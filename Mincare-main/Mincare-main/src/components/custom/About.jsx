import React from 'react';
import { Target, Eye, Trophy, Users, Quote, Check, Award, Clock } from 'lucide-react';

function About() {
  const achievements = [
    { number: '10+', title: 'Years Experience', icon: <Trophy className="w-8 h-8 text-[#667449]" /> },
    { number: '500+', title: 'Happy Clients', icon: <Users className="w-8 h-8 text-[#667449]" /> },
    { number: '50+', title: 'Awards Won', icon: <Award className="w-8 h-8 text-[#667449]" /> },
    { number: '24/7', title: 'Support', icon: <Clock className="w-8 h-8 text-[#667449]" /> }
  ];

  const testimonials = [
    {
      quote: "This company transformed our business completely. Their expertise is unmatched in the industry.",
      author: "Sarah Johnson",
      position: "CEO, TechSolutions"
    },
    {
      quote: "Exceptional service and attention to detail. We've been partners for 5 years and counting.",
      author: "Michael Chen",
      position: "Director, Global Corp"
    }
  ];

  return (
    <div className="bg-white">
      {/* Hero Banner */}
      <div className="relative h-96 w-full">
        <img 
          src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80" 
          alt="About Us Banner" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
          <div className="text-center text-white px-4">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">About Our Company</h1>
            <p className="text-xl max-w-3xl mx-auto">Building trust and excellence since 2010</p>
          </div>
        </div>
      </div>

      {/* Company Overview */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Story</h2>
            <p className="text-lg text-gray-600 mb-6">
              Founded in 2010, we started as a small team with big dreams. Today, we're proud to be a leader in our industry, serving clients across the globe with innovative solutions and unparalleled service.
            </p>
            <p className="text-lg text-gray-600 mb-6">
              Our journey has been marked by continuous growth, learning, and adaptation to the ever-changing market needs. We believe in creating value through excellence and building lasting relationships.
            </p>
            <div className="bg-blue-50 p-6 rounded-lg">
              <h3 className="text-xl font-semibold text-[#667449] mb-3">Why Choose Us?</h3>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start">
                  <Check className="w-5 h-5 text-[#667449] mr-2 mt-0.5 flex-shrink-0" />
                  Industry-leading expertise and experience
                </li>
                <li className="flex items-start">
                  <Check className="w-5 h-5 text-[#667449] mr-2 mt-0.5 flex-shrink-0" />
                  Customer-centric approach
                </li>
                <li className="flex items-start">
                  <Check className="w-5 h-5 text-[#667449] mr-2 mt-0.5 flex-shrink-0" />
                  Innovative and customized solutions
                </li>
                <li className="flex items-start">
                  <Check className="w-5 h-5 text-[#667449] mr-2 mt-0.5 flex-shrink-0" />
                  Transparent and ethical business practices
                </li>
              </ul>
            </div>
          </div>
          <div className="rounded-xl overflow-hidden shadow-xl">
            <img 
              src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80" 
              alt="Our Team" 
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">Our Core Values</h2>
            <p className="text-lg text-gray-600 mt-4 max-w-3xl mx-auto">
              Guiding principles that shape our culture and business approach
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white p-8 rounded-xl shadow-md">
              <div className="flex items-center mb-4">
                <div className="bg-blue-100 p-3 rounded-full mr-4">
                  <Target className="w-6 h-6 text-[#667449]" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Our Mission</h3>
              </div>
              <p className="text-gray-600">
                To deliver exceptional value through innovative solutions, building lasting partnerships with our clients while maintaining the highest standards of integrity and professionalism.
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-xl shadow-md">
              <div className="flex items-center mb-4">
                <div className="bg-blue-100 p-3 rounded-full mr-4">
                  <Eye className="w-6 h-6 text-[#667449]" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Our Vision</h3>
              </div>
              <p className="text-gray-600">
                To be the most trusted and respected company in our industry, recognized globally for our commitment to excellence, innovation, and positive impact on our clients and communities.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Achievements */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {achievements.map((item, index) => (
              <div key={index} className="bg-white p-6 rounded-xl shadow-md text-center">
                {item.icon}
                <p className="text-4xl font-bold text-gray-900 mt-4">{item.number}</p>
                <p className="text-gray-600">{item.title}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">What Our Clients Say</h2>
            <p className="text-lg text-gray-600 mt-4">
              Hear from our valued customers about their experiences
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white p-8 rounded-xl shadow-md">
                <Quote className="w-8 h-8 text-[#667449] mb-4" />
                <p className="text-gray-600 italic mb-6">{testimonial.quote}</p>
                <div className="border-t pt-4">
                  <p className="font-semibold text-gray-900">{testimonial.author}</p>
                  <p className="text-gray-600 text-sm">{testimonial.position}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section (Optional) */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">Meet Our Leadership</h2>
            <p className="text-lg text-gray-600 mt-4">
              The talented individuals driving our success
            </p>
          </div>
          
          <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {/* Team members would go here */}
          </div>
        </div>
      </section>
    </div>
  );
}

export default About;