import React from 'react';
import './assets/Spinner.css'; // Asegúrate de crear este archivo CSS

const Spinner = () => {
    return (
        <div className="spinner">
            <div className="loader"></div>
            <p>Recibiendo datos...aguarde por favor..</p>
        </div>
    );
};

export default Spinner;