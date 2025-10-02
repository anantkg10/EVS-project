
import React, { useState, useMemo } from 'react';
import Icon from '../components/Icon';
import { Article } from '../types';
import HolographicButton from '../components/HolographicButton';

const articles: Article[] = [
    { 
        id: 1, title: 'Understanding Powdery Mildew', category: 'Fungal Diseases', icon: 'leaf', image: 'https://picsum.photos/seed/mildew/400/200',
        summary: 'A common fungal disease that affects a wide variety of plants, appearing as white powdery spots on leaves and stems.',
        content: (
            <div className="space-y-4 text-gray-300">
                <p>Powdery mildew is easily identifiable by its white, powdery spots on the leaves and stems of affected plants. These spots can spread to cover most of the leaf surface, which can inhibit photosynthesis and weaken the plant.</p>
                <h4 className="text-lg font-bold text-green-300">Causes:</h4>
                <ul className="list-disc pl-6 space-y-1">
                    <li>High humidity at night and low humidity during the day.</li>
                    <li>Poor air circulation around plants.</li>
                    <li>Moderate temperatures (60-80°F or 15-27°C).</li>
                </ul>
                <h4 className="text-lg font-bold text-green-300">Management:</h4>
                <ul className="list-disc pl-6 space-y-1">
                    <li>Apply fungicides, either organic (like neem oil or potassium bicarbonate) or synthetic.</li>
                    <li>Prune affected areas to improve air circulation and reduce spread.</li>
                    <li>Ensure proper plant spacing from the outset.</li>
                </ul>
            </div>
        )
    },
    { 
        id: 2, title: 'Best Practices for Crop Rotation', category: 'Farming Techniques', icon: 'rotate', image: 'https://picsum.photos/seed/rotation/400/200',
        summary: 'The practice of growing a series of different types of crops in the same area across a sequence of growing seasons.',
        content: (
            <div className="space-y-4 text-gray-300">
                <p>Crop rotation is a cornerstone of sustainable agriculture. It helps to manage soil fertility, reduce soil erosion, and control pests and diseases by breaking their life cycles.</p>
                <h4 className="text-lg font-bold text-green-300">Key Principles:</h4>
                <ul className="list-disc pl-6 space-y-1">
                    <li><strong>Alternate plant families:</strong> Avoid planting crops from the same family in the same spot consecutively (e.g., tomatoes and potatoes).</li>
                    <li><strong>Vary rooting depths:</strong> Follow deep-rooted crops with shallow-rooted ones to utilize different soil layers.</li>
                    <li><strong>Incorporate legumes:</strong> Plants like beans and peas fix nitrogen in the soil, benefiting the crops that follow.</li>
                </ul>
            </div>
        )
    },
    { 
        id: 3, title: 'Identifying and Managing Aphids', category: 'Pest Control', icon: 'warning', image: 'https://picsum.photos/seed/aphids/400/200',
        summary: 'Small, sap-sucking insects that can multiply rapidly, causing significant damage to plants and transmitting diseases.',
        content: (
            <div className="space-y-4 text-gray-300">
                <p>Aphids are tiny, pear-shaped insects that cluster on new growth and the undersides of leaves. They feed on plant sap, which can lead to stunted growth, yellowing leaves, and the production of a sticky substance called honeydew.</p>
                <h4 className="text-lg font-bold text-green-300">Control Methods:</h4>
                 <ul className="list-disc pl-6 space-y-1">
                    <li><strong>Physical Removal:</strong> A strong jet of water can dislodge them from plants.</li>
                    <li><strong>Natural Predators:</strong> Encourage ladybugs, lacewings, and parasitic wasps.</li>
                    <li><strong>Soaps and Oils:</strong> Insecticidal soaps and horticultural oils like neem oil are effective and low-impact options.</li>
                </ul>
            </div>
        )
    },
    { 
        id: 4, title: 'The Role of Soil Health', category: 'Soil Management', icon: 'shield', image: 'https://picsum.photos/seed/soil/400/200',
        summary: 'Healthy soil is the foundation of a productive farm, providing essential nutrients, water, oxygen, and root support.',
        content: (
            <div className="space-y-4 text-gray-300">
                <p>Healthy soil is a complex ecosystem teeming with life. Its structure and composition are critical for preventing diseases and ensuring robust plant growth.</p>
                <h4 className="text-lg font-bold text-green-300">Improving Soil Health:</h4>
                 <ul className="list-disc pl-6 space-y-1">
                    <li><strong>Add Organic Matter:</strong> Compost, manure, and cover crops enrich the soil.</li>
                    <li><strong>Minimize Tillage:</strong> No-till or low-till practices protect soil structure and microbial life.</li>
                    <li><strong>Keep Soil Covered:</strong> Use mulch or cover crops to prevent erosion and retain moisture.</li>
                </ul>
            </div>
        )
    },
];

const ArticleDetailView: React.FC<{ article: Article; onBack: () => void }> = ({ article, onBack }) => (
    <div className="container mx-auto p-4">
        <HolographicButton onClick={onBack} className="mb-8 py-2 px-4 text-sm">
            &larr; Back to Hub
        </HolographicButton>
        <div className="bg-black/30 backdrop-blur-md rounded-xl holographic-border overflow-hidden">
            <img src={article.image} alt={article.title} className="w-full h-64 object-cover" />
            <div className="p-8">
                <p className="text-sm text-green-400 mb-2">{article.category}</p>
                <h2 className="text-4xl font-bold text-white mb-6">{article.title}</h2>
                {article.content}
            </div>
        </div>
    </div>
);

const KnowledgeHubView: React.FC = () => {
    const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    const filteredArticles = useMemo(() => 
        articles.filter(article => 
            article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            article.category.toLowerCase().includes(searchTerm.toLowerCase())
        ),
    [searchTerm]);

    if (selectedArticle) {
        return <ArticleDetailView article={selectedArticle} onBack={() => setSelectedArticle(null)} />;
    }

    return (
        <div className="container mx-auto p-4">
            <div className="text-center mb-12">
                <h2 className="text-4xl font-bold text-green-300">Knowledge Hub</h2>
                <p className="text-gray-400 max-w-2xl mx-auto mt-4">
                    Explore our library of guides and best practices to enhance your farming skills.
                </p>
                 <div className="mt-6 max-w-lg mx-auto">
                    <input
                        type="text"
                        placeholder="Search articles..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-black/30 holographic-border rounded-full px-6 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-400"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredArticles.map((article) => (
                    <div 
                        key={article.id} 
                        className="bg-black/30 backdrop-blur-md rounded-xl holographic-border overflow-hidden group transform hover:-translate-y-2 transition-transform duration-300 cursor-pointer"
                        onClick={() => setSelectedArticle(article)}
                    >
                        <img src={article.image} alt={article.title} className="w-full h-40 object-cover group-hover:opacity-80 transition-opacity" />
                        <div className="p-6">
                            <p className="text-sm text-green-400 mb-1">{article.category}</p>
                            <h3 className="text-xl font-bold text-white mb-2">{article.title}</h3>
                            <p className="text-gray-400 text-sm mb-4">{article.summary}</p>
                            <div className="flex items-center space-x-2 text-green-300 font-semibold group-hover:text-white transition-colors">
                                <span>Read More</span>
                                <Icon name="arrowRight" className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            {filteredArticles.length === 0 && (
                <div className="text-center py-10">
                    <p className="text-lg text-gray-400">No articles found matching your search.</p>
                </div>
            )}
        </div>
    );
};

export default KnowledgeHubView;
