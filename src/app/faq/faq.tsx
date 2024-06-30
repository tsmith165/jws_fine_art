'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { IoIosArrowForward } from 'react-icons/io';
import faqData from '@/lib/faq_data';

export default function FAQ() {
    return (
        <div className="flex flex-col space-y-4 p-4">
            <h1 className="bg-gradient-to-r from-primary via-primary_dark to-primary bg-clip-text text-center text-4xl font-bold text-transparent">
                FAQ
            </h1>
            {faqData.map((item, index) => (
                <FAQItem key={index} question={item.question} answer={item.answer} />
            ))}
        </div>
    );
}

function FAQItem({ question, answer }: { question: string; answer: string }) {
    const [isOpen, setIsOpen] = React.useState(false);

    return (
        <div className="cursor-pointer border-b border-gray-300 py-2" onClick={() => setIsOpen(!isOpen)}>
            <div className="flex items-center space-x-2">
                <motion.div animate={{ rotate: isOpen ? 90 : 0 }} transition={{ duration: 0.2 }}>
                    <IoIosArrowForward size={20} />
                </motion.div>
                <h2 className="text-lg font-semibold">{question}</h2>
            </div>
            {isOpen && (
                <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    className="mt-2"
                >
                    <p className="font-sans text-stone-300">{answer}</p>
                </motion.div>
            )}
        </div>
    );
}
