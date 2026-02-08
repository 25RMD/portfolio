import { useState, useRef } from 'react';
import AnimatedGrid from './AnimatedGrid';
import SplitText from './SplitText';

export default function Contact() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        message: ''
    });
    const [errors, setErrors] = useState({});
    const [submitted, setSubmitted] = useState(false);
    const formRef = useRef(null);

    const handleSubmit = (e) => {
        e.preventDefault();

        const newErrors = {};
        if (!formData.name.trim()) newErrors.name = true;
        if (!formData.email.trim()) newErrors.email = true;
        if (!formData.message.trim()) newErrors.message = true;

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            setTimeout(() => setErrors({}), 600);
            return;
        }

        setSubmitted(true);
        setTimeout(() => setSubmitted(false), 1000);

        const subject = `Project Inquiry from ${formData.name}`;
        const body = `Name: ${formData.name}%0D%0AEmail: ${formData.email}%0D%0A%0D%0A${formData.message}`;
        window.location.href = `mailto:19thdanielutho@gmail.com?subject=${encodeURIComponent(subject)}&body=${body}`;
    };

    const handleChange = (e) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
    };

    return (
        <section
            id="contact"
            data-cursor-invert
            className="relative w-full min-h-screen bg-black text-white z-10 pt-12 md:pt-24 pb-12 px-6 md:px-12 overflow-x-clip"
        >
            {/* Background Animations */}
            <div className="absolute inset-0 z-0 opacity-40">
                <AnimatedGrid color="255, 255, 255" />
            </div>

            <div className="max-w-7xl mx-auto w-full flex flex-col gap-10 md:gap-16 relative z-10">
                {/* Section Header */}
                <div className="flex items-end justify-between gap-8">
                    <h2
                        className="font-syne text-5xl md:text-7xl lg:text-8xl font-extrabold tracking-tighter leading-[0.9] uppercase transition-transform duration-500 hover:skew-x-6 origin-left inline-block overflow-hidden"
                    >
                        <SplitText>Let's Create</SplitText>
                    </h2>
                </div>

                <div className="w-full h-px bg-white/10 reveal-line" />

                {/* Content */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-24 items-start">
                    {/* Left - Description + Email */}
                    <div className="flex flex-col gap-8 reveal reveal-delay-1">
                        <p className="font-space text-lg md:text-xl leading-relaxed opacity-70">
                            Have a project in mind? Let's build something extraordinary together.
                            I'm currently available for freelance work and collaborations.
                        </p>
                        <div className="flex flex-col gap-2 mt-4">
                            <p className="font-space text-xs font-bold tracking-widest opacity-40">DIRECT EMAIL</p>
                            <a
                                href="mailto:19thdanielutho@gmail.com"
                                className="font-syne text-lg sm:text-2xl md:text-3xl font-bold hover:opacity-70 transition-opacity break-all sm:break-normal"
                            >
                                19thdanielutho@gmail.com
                            </a>
                        </div>
                    </div>

                    {/* Right - Form */}
                    <div className="reveal reveal-delay-2">
                        <form ref={formRef} onSubmit={handleSubmit} className="flex flex-col gap-12">
                            <div className={`group relative ${errors.name ? 'shake' : ''}`}>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    required
                                    value={formData.name}
                                    onChange={handleChange}
                                    className={`peer w-full bg-transparent py-4 border-b font-space text-lg focus:outline-none transition-colors placeholder-transparent ${errors.name ? 'border-red-400' : 'border-white/20 focus:border-white'}`}
                                    placeholder="Name"
                                />
                                <label
                                    htmlFor="name"
                                    className="absolute left-0 top-4 font-space text-sm font-bold tracking-widest uppercase transition-all duration-300 pointer-events-none text-white/50
                                    peer-focus:-top-2 peer-focus:text-[10px] peer-focus:text-white
                                    peer-[:not(:placeholder-shown)]:-top-2 peer-[:not(:placeholder-shown)]:text-[10px] peer-[:not(:placeholder-shown)]:text-white"
                                >
                                    Name
                                </label>
                            </div>

                            <div className={`group relative ${errors.email ? 'shake' : ''}`}>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    required
                                    value={formData.email}
                                    onChange={handleChange}
                                    className={`peer w-full bg-transparent py-4 border-b font-space text-lg focus:outline-none transition-colors placeholder-transparent ${errors.email ? 'border-red-400' : 'border-white/20 focus:border-white'}`}
                                    placeholder="Email"
                                />
                                <label
                                    htmlFor="email"
                                    className="absolute left-0 top-4 font-space text-sm font-bold tracking-widest uppercase transition-all duration-300 pointer-events-none text-white/50
                                    peer-focus:-top-2 peer-focus:text-[10px] peer-focus:text-white
                                    peer-[:not(:placeholder-shown)]:-top-2 peer-[:not(:placeholder-shown)]:text-[10px] peer-[:not(:placeholder-shown)]:text-white"
                                >
                                    Email
                                </label>
                            </div>

                            <div className={`group relative ${errors.message ? 'shake' : ''}`}>
                                <textarea
                                    id="message"
                                    name="message"
                                    required
                                    rows="1"
                                    style={{ minHeight: '3rem' }}
                                    value={formData.message}
                                    onChange={(e) => {
                                        handleChange(e);
                                        e.target.style.height = 'auto';
                                        e.target.style.height = e.target.scrollHeight + 'px';
                                    }}
                                    className={`peer w-full bg-transparent py-4 border-b font-space text-lg focus:outline-none transition-colors resize-none placeholder-transparent ${errors.message ? 'border-red-400' : 'border-white/20 focus:border-white'}`}
                                    placeholder="Message"
                                />
                                <label
                                    htmlFor="message"
                                    className="absolute left-0 top-4 font-space text-sm font-bold tracking-widest uppercase transition-all duration-300 pointer-events-none text-white/50
                                    peer-focus:-top-2 peer-focus:text-[10px] peer-focus:text-white
                                    peer-[:not(:placeholder-shown)]:-top-2 peer-[:not(:placeholder-shown)]:text-[10px] peer-[:not(:placeholder-shown)]:text-white"
                                >
                                    Message
                                </label>
                            </div>

                            <button
                                type="submit"
                                className={`mt-8 px-12 py-4 bg-white text-black font-space font-bold tracking-widest hover:bg-gray-200 transition-colors w-full rounded-sm uppercase ${submitted ? 'success-pulse' : ''}`}
                            >
                                {submitted ? 'Sent!' : 'Send Inquiry'}
                            </button>
                        </form>
                    </div>
                </div>
            </div>

        </section>
    );
}
