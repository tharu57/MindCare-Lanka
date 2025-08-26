import React from 'react'
import Hero from './Hero'
import Doctorslist from './Doctorslist'
import TreatmentList from './TreatmentList'

function Home() {
  return (
    <>
  <Hero />
  <Doctorslist limit={4} />
   
  <TreatmentList limit={4}/>
  
  </>
  )
}

export default Home