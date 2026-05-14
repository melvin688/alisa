import React from 'react';
import { Coffee, Leaf, Flame, Layers } from 'lucide-react';
import { Language } from '../types';

interface FeaturesProps {
    lang: Language;
}

export const Features: React.FC<FeaturesProps> = ({ lang }) => {
    const features = [
        {
            icon: <Coffee size={40} strokeWidth={1} />,
            title: lang === 'en' ? 'Meticulous Quality' : '极致品质',
            desc: lang === 'en' ? 'Meticulous Quality' : '极致品质'
        },
        {
            icon: <Leaf size={40} strokeWidth={1} />,
            title: lang === 'en' ? 'Ethically Sourced' : '道德采购',
            desc: lang === 'en' ? 'Ethically Sourced' : '道德采购'
        },
        {
            icon: <Flame size={40} strokeWidth={1} />,
            title: lang === 'en' ? 'Small Batch Roasting' : '小批量烘焙',
            desc: lang === 'en' ? 'Small Batch Roasting' : '小批量烘焙'
        },
        {
            icon: <Layers size={40} strokeWidth={1} />,
            title: lang === 'en' ? 'Customized Subscription' : '定制订阅',
            desc: lang === 'en' ? 'Customized Subscription' : '定制订阅'
        }
    ];

    return (
        <div className="bg-white py-16 border-b border-gray-100">
            <div className="max-w-7xl mx-auto px-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                    {features.map((feature, idx) => (
                        <div key={idx} className="flex flex-col items-center gap-4 text-felix-teal">
                            <div className="p-2">
                                {feature.icon}
                            </div>
                            <h3 className="font-serif text-lg tracking-wide">{feature.title}</h3>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};