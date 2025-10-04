function replace_from(input, out) {
    if (input.includes('from=')) {
        const parts = input.split('&');
        const filteredParts = parts.filter(part => !part.startsWith('from='));
        filteredParts.push(`from=${out}`);
        
        return filteredParts.join('&');
    }
    
    return input;
}

function cv_json(jsonObj) {
    return Object.entries(jsonObj)
        .map(([key, value]) => `${key}|${value}`)
        .join('\n');
}

module.exports = { 
    replace_from,
    cv_json 
};