import React from 'react';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '../ui/carousel';

function Hero() {
  const carouselItems = [
    {
      id: 1,
      imageUrl: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
      title: 'Premium Healthcare Services',
      description: 'Experience world-class medical care with our team of expert professionals dedicated to your wellbeing.'
    },
    {
      id: 2,
      imageUrl: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
      title: 'Advanced Treatment Options',
      description: 'Access cutting-edge medical treatments and technologies for better health outcomes.'
    },
    {
      id: 3,
      imageUrl: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
      title: 'Compassionate Care',
      description: 'Our patient-centered approach ensures you receive personalized attention and care.'
    }
  ];

  return (
    <section className="relative w-full h-[80vh] max-h-[800px] overflow-hidden">
      <Carousel className="w-full h-full">
        <CarouselContent className="h-full">
          {carouselItems.map((item) => (
            <CarouselItem key={item.id} className="relative h-full">
              {/* Image with opacity overlay */}
              <div className="absolute inset-0 bg-black/30 z-10"></div>
              <img 
                src={item.imageUrl} 
                alt={item.title}
                className="w-full h-full object-cover"
              />
              
              {/* Text content - left aligned */}
              <div className="absolute inset-0 z-20 flex flex-col justify-center items-start px-8 sm:px-12 lg:px-24">
                <div className="max-w-2xl text-white space-y-6">
                  <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-left">
                    {item.title}
                  </h1>
                  <p className="text-lg sm:text-xl lg:text-2xl opacity-90 text-left">
                    {item.description}
                  </p>
                  <div className="pt-4 flex justify-end w-full">
                    <button className="bg-white text-blue-600 hover:bg-blue-50 px-6 py-3 rounded-md font-medium text-lg transition-colors duration-200">
                      Learn More
                    </button>
                  </div>
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        
        {/* Navigation arrows */}
        <CarouselPrevious className="absolute left-4 top-1/2 -translate-y-1/2 z-30 h-12 w-12 rounded-full bg-white/30 hover:bg-white/50 text-white backdrop-blur-sm" />
        <CarouselNext className="absolute right-4 top-1/2 -translate-y-1/2 z-30 h-12 w-12 rounded-full bg-white/30 hover:bg-white/50 text-white backdrop-blur-sm" />
      </Carousel>
    </section>
  );
}

export default Hero;