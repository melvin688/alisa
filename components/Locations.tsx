import React from 'react';
import { UI_TEXT, LOCAL_LOCATIONS } from '../constants';
import { Language } from '../types';
import { MapPin } from 'lucide-react';

interface LocationsProps {
    lang: Language;
}

export const Locations: React.FC<LocationsProps> = ({ lang }) => {
    const t = UI_TEXT[lang].locations;
    const locations = LOCAL_LOCATIONS;
    
    return (
        <div className="bg-felix-teal text-white py-24 px-6 relative overflow-hidden">
             {/* Pattern overlay */}
            <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>

            <div className="max-w-7xl mx-auto relative z-10">
                <div className="text-center mb-16">
                    <h2 className="font-serif text-5xl mb-4">{t.title}</h2>
                    <p className="font-light text-felix-pink text-xl">{t.subtitle}</p>
                </div>

                <div className="grid md:grid-cols-2 gap-12">
                    {locations.map((loc, idx) => {
                        const name = lang === 'zh' ? loc.name_zh : loc.name;
                        const address = lang === 'zh' ? loc.address_zh : loc.address;
                        const hours = lang === 'zh' ? loc.hours_zh : loc.hours;

                        return (
                            <div key={idx} className="flex flex-col md:flex-row bg-felix-teal-light/20 border border-felix-gold/30 group hover:bg-felix-teal-light/40 transition-colors">
                                <div className="w-full md:w-1/2 overflow-hidden">
                                    <img src={loc.image} alt={name} className="w-full h-64 md:h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" />
                                </div>
                                <div className="p-8 flex flex-col justify-center w-full md:w-1/2">
                                    <h3 className="font-serif text-2xl text-felix-gold mb-2">{name}</h3>
                                    <div className="flex items-start gap-2 mb-4 text-gray-300">
                                        <MapPin size={18} className="mt-1 shrink-0" />
                                        <p>{address}</p>
                                    </div>
                                    <p className="text-sm uppercase tracking-widest text-felix-pink border-t border-felix-gold/30 pt-4">{hours}</p>
                                    <button className="mt-6 text-left text-xs uppercase tracking-widest hover:text-felix-gold underline decoration-felix-gold/50 underline-offset-4">
                                        {t.getDirections}
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}