import React, { useState } from 'react';
import { MapPin, Phone, Mail, Clock, Send } from 'lucide-react';

function Contact() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');

  const onSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setSubmitMessage('');

    const formData = new FormData(event.target);
    formData.append("access_key", "aa345618-85eb-423f-8b76-daec77d1311d"); // Replace with your actual access key

    const object = Object.fromEntries(formData);
    const json = JSON.stringify(object);

    try {
      const res = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json"
        },
        body: json
      }).then((res) => res.json());

      if (res.success) {
        setSubmitMessage('Message sent successfully!');
        event.target.reset();
      } else {
        setSubmitMessage('Failed to send message. Please try again.');
      }
    } catch (error) {
      setSubmitMessage('Failed to send message. Please try again.');
    }

    setIsSubmitting(false);
  };

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <div className="relative h-80 w-full bg-gray-900">
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
          <div className="text-center text-white px-4">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Contact Us</h1>
            <p className="text-xl">We'd love to hear from you</p>
          </div>
        </div>
      </div>

      {/* Contact Grid */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 gap-12">
          {/* Contact Information */}
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Get in Touch</h2>
            
            <div className="space-y-6">
              <div className="flex items-start">
                <div className="bg-green-100 p-3 rounded-full mr-4">
                  <MapPin className="w-6 h-6 text-[#667449]" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Our Location</h3>
                  <p className="text-gray-600">123 Business Avenue<br />New York, NY 10001<br />United States</p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="bg-green-100 p-3 rounded-full mr-4">
                  <Phone className="w-6 h-6 text-[#667449]" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Phone Numbers</h3>
                  <p className="text-gray-600">
                    Main: <a href="tel:+18005551234" className="hover:text-[#667449]">+1 (800) 555-1234</a><br />
                    Support: <a href="tel:+18005554321" className="hover:text-[#667449]">+1 (800) 555-4321</a>
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="bg-green-100 p-3 rounded-full mr-4">
                  <Mail className="w-6 h-6 text-[#667449]" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Email Addresses</h3>
                  <p className="text-gray-600">
                    General: <a href="mailto:info@company.com" className="hover:text-[#667449]">info@company.com</a><br />
                    Support: <a href="mailto:support@company.com" className="hover:text-[#667449]">support@company.com</a>
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="bg-green-100 p-3 rounded-full mr-4">
                  <Clock className="w-6 h-6 text-[#667449]" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Business Hours</h3>
                  <p className="text-gray-600">
                    Monday - Friday: 9:00 AM - 6:00 PM<br />
                    Saturday: 10:00 AM - 4:00 PM<br />
                    Sunday: Closed
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-white p-8 rounded-xl shadow-lg">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Send Us a Message</h2>
            
            {/* Success/Error Message */}
            {submitMessage && (
              <div className={`p-4 mb-6 rounded-md ${
                submitMessage.includes('successfully') 
                  ? 'bg-green-100 text-green-700 border border-green-300' 
                  : 'bg-red-100 text-red-700 border border-red-300'
              }`}>
                {submitMessage}
              </div>
            )}

            <form onSubmit={onSubmit} className="space-y-6">
              {/* Hidden fields for web3forms */}
              <input type="hidden" name="subject" value="New Contact Form Submission" />
              <input type="checkbox" name="botcheck" className="hidden" style={{display: "none"}} />
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    disabled={isSubmitting}
                    className="w-full px-4 py-3 rounded-md border border-gray-300 focus:ring-text-[#667449] focus:border-text-[#667449] disabled:bg-gray-100 disabled:cursor-not-allowed"
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    disabled={isSubmitting}
                    className="w-full px-4 py-3 rounded-md border border-gray-300 focus:ring-text-[#667449] focus:border-text-[#667449] disabled:bg-gray-100 disabled:cursor-not-allowed"
                    placeholder="your.email@example.com"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">Phone (optional)</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  disabled={isSubmitting}
                  className="w-full px-4 py-3 rounded-md border border-gray-300 focus:ring-text-[#667449] focus:border-text-[#667449] disabled:bg-gray-100 disabled:cursor-not-allowed"
                  placeholder="Your phone number"
                />
              </div>
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                <textarea
                  id="message"
                  name="message"
                  rows="5"
                  required
                  disabled={isSubmitting}
                  className="w-full px-4 py-3 rounded-md border border-gray-300 focus:ring-text-[#667449] focus:border-text-[#667449] disabled:bg-gray-100 disabled:cursor-not-allowed"
                  placeholder="Your message here..."
                ></textarea>
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-lime-800 text-white py-3 px-6 rounded-md hover:bg-text-[#667449] disabled:bg-lime-400 disabled:cursor-not-allowed transition-colors duration-200 flex items-center justify-center"
              >
                <Send className="w-5 h-5 mr-2" />
                {isSubmitting ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="w-full h-96 bg-gray-100">
        <iframe
          title="Company Location"
          width="100%"
          height="100%"
          frameBorder="0"
          scrolling="no"
          marginHeight="0"
          marginWidth="0"
          src="https://maps.google.com/maps?q=123%20Business%20Avenue%2C%20New%20York%2C%20NY%2010001&t=&z=14&ie=UTF8&iwloc=&output=embed"
          className="border-0"
        ></iframe>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-[#667449] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Need Our Help ? </h2>
          <p className="text-xl mb-8 max-w-3xl mx-auto">
            Contact us today to discuss how we can help you achieve your goals.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <a
              href="tel:+94760848706"
              className="bg-white text-[#667449] px-6 py-3 rounded-md font-medium hover:bg-blue-50 transition-colors duration-200"
            >
              Call Us Now
            </a>
            <a
              href="mailto:info@company.com"
              className="bg-transparent border-2 border-white px-6 py-3 rounded-md font-medium hover:bg-white/10 transition-colors duration-200"
            >
              Email Us
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Contact;