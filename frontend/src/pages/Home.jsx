import { motion } from 'framer-motion';
import { FaTruck, FaTools, FaIndustry, FaHandshake, FaArrowRight } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { Parallax } from 'react-parallax';
import hero from '../assets/hero.webp';
import about from '../assets/abouts.jpg';

const Home = () => {
  return (
    <div className="min-h-screen">
      <Parallax
        blur={0}
        bgImage={hero}
        bgImageAlt="hero"
        strength={200}
        className="relative min-h-screen"
      >
        {/* Dark overlay with gradients */}
        <div className="absolute inset-0 bg-black/70" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-black/40 to-black/50" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/50" />

        {/* Dot pattern */}
        <div 
          className="absolute inset-0"
          style={{
            backgroundImage: 'radial-gradient(rgba(255,255,255,0.1) 1px, transparent 1px)',
            backgroundSize: '50px 50px'
          }}
        />

        {/* Content */}
        <div className="relative min-h-screen flex items-center justify-center px-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center text-white max-w-6xl"
          >
            <motion.p
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="text-blue-400 font-semibold mb-4 tracking-wider"
            >
              WELCOME TO D.S. ENTERPRISE
            </motion.p>

            <motion.h1
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-7xl font-bold mb-8 bg-clip-text text-transparent bg-gradient-to-r from-white via-blue-100 to-gray-300 leading-tight"
            >
              Industrial Solutions <br /> for Tomorrow
            </motion.h1>

            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-2xl mb-12 text-gray-300 max-w-3xl mx-auto leading-relaxed"
            >
              Your trusted partner for quality industrial products and innovative equipment solutions
            </motion.p>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="flex gap-6 justify-center"
            >
              <Link
                to="/products"
                className="px-10 py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 rounded-full font-semibold transition-all duration-300 flex items-center gap-3 group shadow-lg hover:shadow-blue-500/50"
              >
                Explore Products
                <FaArrowRight className="group-hover:translate-x-2 transition-transform" />
              </Link>
              <Link
                to="/contactus"
                className="px-10 py-4 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full font-semibold transition-all duration-300 border border-white/20 hover:border-white/40 shadow-lg"
              >
                Contact Us
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </Parallax>

      {/* Features Section */}
      <section className="py-24 bg-gradient-to-b from-gray-900 to-gray-800">
        <div className="container mx-auto px-4">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-5xl font-bold text-center mb-20 text-white"
          >
            Why Choose Us
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { icon: <FaTruck />, title: 'Fast Delivery', desc: 'Quick and reliable shipping across India' },
              { icon: <FaTools />, title: 'Quality Products', desc: 'Premium industrial equipment and tools' },
              { icon: <FaIndustry />, title: 'Expert Support', desc: '24/7 technical assistance available' },
              { icon: <FaHandshake />, title: 'Best Deals', desc: 'Competitive pricing guaranteed' }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -10 }}
                className="bg-gray-800/50 p-8 rounded-2xl backdrop-blur-lg border border-gray-700 hover:border-blue-500/30 transition-all duration-300"
              >
                <div className="text-4xl text-blue-400 mb-6">
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-bold mb-4 text-white">{feature.title}</h3>
                <p className="text-gray-400">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>


      {/* About Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-12">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              className="flex-1"
            >
              <h2 className="text-4xl font-bold mb-6">About D.S. Enterprise</h2>
              <p className="text-lg text-gray-600 mb-6 max-w-[60%]">
                With years of experience in the industrial sector, we provide top-quality equipment
                and exceptional service to businesses across India.
              </p>
              <Link to="/about" className="btn btn-outline btn-primary">
                Learn More
              </Link>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              className="flex"
            >
              <img
                src={about}
                alt="About Us"
                className="rounded-lg shadow-xl"
              />
            </motion.div>
          </div>
        </div>
      </section>


      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-b from-gray-900 to-black relative overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h2 className="text-4xl font-bold mb-6 text-white">Ready to Get Started?</h2>
            <p className="text-xl mb-8 text-gray-400 max-w-2xl mx-auto">
              Browse our extensive collection of industrial products and find exactly what you need.
            </p>
            <Link
              to="/products"
              className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-semibold transition-all duration-300 group"
            >
              View Products
              <FaArrowRight className="group-hover:translate-x-2 transition-transform" />
            </Link>
          </motion.div>
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/50" />
      </section>
    </div>
  );
};

export default Home;