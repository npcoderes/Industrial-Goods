import { motion } from 'framer-motion';
import { FaHistory, FaLightbulb, FaBullseye, FaHandshake } from 'react-icons/fa';
import about from '../assets/about-us.webp';
import dharav from '../assets/dharav.jpg';

const About = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black">
      {/* Hero Section */}
      <section className="relative h-[60vh] overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-fixed"
          style={{ backgroundImage: `url(${about})` }}
        />
        <div className="absolute inset-0 bg-black/70" />
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center text-white"
          >
            <h1 className="text-5xl md:text-7xl font-bold mb-4">About Us</h1>
            <p className="text-xl text-gray-300">Building Tomorrow's Industry Today</p>
          </motion.div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
            >
              <h2 className="text-4xl font-bold mb-6 text-white">Our Story</h2>
              <p className="text-gray-300 mb-4">
              DS Enterprise-One Step Solution is the trusted B2B product platform in India, We specialize in a wide variety of industrial products that cater to the needs of businesses and SMEs. Over the past three years, we have served 
              </p>
              <p className="text-gray-300">
              more than 1.5 million SME customers and have established India's largest catalog of products from globally renowned brands, encompassing over 12 categories....
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              className="relative"
            >
              <img 
                src={about} 
                alt="Our Story" 
                className="rounded-lg shadow-2xl"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-gray-900/50">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-16 text-white">Our Core Values</h2>
          <div className="grid md:grid-cols-4 gap-8">
            {[
              { icon: <FaHistory />, title: 'Experience', desc: 'Years of industry expertise' },
              { icon: <FaLightbulb />, title: 'Innovation', desc: 'Cutting-edge solutions' },
              { icon: <FaBullseye />, title: 'Quality', desc: 'Premium products' },
              { icon: <FaHandshake />, title: 'Trust', desc: 'Reliable partnerships' }
            ].map((value, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="text-center p-6 bg-white/5 rounded-lg backdrop-blur-sm"
              >
                <div className="text-4xl text-blue-400 mb-4">{value.icon}</div>
                <h3 className="text-xl font-bold mb-2 text-white">{value.title}</h3>
                <p className="text-gray-400">{value.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-16 text-white">Our Leadership</h2>
          <div className="grid md:grid-cols-2 gap-12">
            {[
              { name: 'Mr. Dharav Shah', role: 'Co-Founder', image: dharav },
              { name: 'Mr. Vaibhav Shah', role: 'Director', image: about }
            ].map((member, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                className="text-center"
              >
                <div className="w-48 h-48 mx-auto mb-6 relative overflow-hidden rounded-full">
                  <img 
                    src={member.image} 
                    alt={member.name}
                    className="object-cover w-full h-full"
                  />
                </div>
                <h3 className="text-2xl font-bold mb-2 text-white">{member.name}</h3>
                <p className="text-blue-400">{member.role}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;