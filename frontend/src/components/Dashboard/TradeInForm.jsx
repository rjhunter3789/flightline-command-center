 import React, { useState, useEffect } from 'react';
  import { X, Save, AlertTriangle, DollarSign, Car, FileText, Camera } from 'lucide-react';
  import './TradeInForm.css';
  import PhotoUpload from './PhotoUpload';

  const TradeInForm = ({ dealId, onClose, onSave, existingTradeIn = null }) => {
    const [formData, setFormData] = useState({
      // Vehicle Info
      vin: '',
      year: new Date().getFullYear(),
      make: '',
      model: '',
      trim: '',
      mileage: '',
      exteriorColor: '',
      interiorColor: '',

      // Condition
      condition: 'good',
      conditionNotes: '',

      // Values
      acv: '',
      allowance: '',
      payoff: '0',

      // Book Values
      bookValues: {
        nada: { clean: '', average: '', rough: '' },
        kbb: { tradein: '', private: '', dealer: '' },
        blackbook: { clean: '', average: '', rough: '' },
        vauto: { marketValue: '', avgMarketPrice: '', daysSupply: '' }
      },

      // Inspection
      inspection: {
        tires: { condition: 'good' },
        brakes: { condition: 'good' },
        engine: { condition: 'good' },
        transmission: { condition: 'good' },
        interior: { condition: 'good' },
        exterior: { condition: 'good' }
      },

      evaluatedBy: localStorage.getItem('userName') || 'Sales Rep'
    });

    const [activeTab, setActiveTab] = useState('vehicle');
    const [calculations, setCalculations] = useState({
      overAllowance: 0,
      equity: 0,
      averageBookValue: 0,
      grossImpact: 0
    });

    const [photos, setPhotos] = useState([]);

    useEffect(() => {
      if (existingTradeIn) {
        setFormData(existingTradeIn);
        if (existingTradeIn.photos) {
            setPhotos(existingTradeIn.photos);
        }
      }
    }, [existingTradeIn]);

    useEffect(() => {
      // Calculate values whenever ACV, allowance, or payoff changes
      const acv = parseFloat(formData.acv) || 0;
      const allowance = parseFloat(formData.allowance) || 0;
      const payoff = parseFloat(formData.payoff) || 0;

      const overAllowance = allowance - acv;
      const equity = allowance - payoff;
      const grossImpact = -overAllowance;

      // Calculate average book value
      const bookPrices = [
        parseFloat(formData.bookValues.nada.average) || 0,
        parseFloat(formData.bookValues.kbb.tradein) || 0,
        parseFloat(formData.bookValues.blackbook.average) || 0,
        parseFloat(formData.bookValues.vauto.marketValue) || 0
      ].filter(price => price > 0);

      const averageBookValue = bookPrices.length > 0
        ? bookPrices.reduce((a, b) => a + b, 0) / bookPrices.length
        : 0;

      setCalculations({
        overAllowance,
        equity,
        averageBookValue: Math.round(averageBookValue),
        grossImpact
      });
    }, [formData.acv, formData.allowance, formData.payoff, formData.bookValues]);

    const handleInputChange = (e) => {
      const { name, value } = e.target;
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    };

    const handleBookValueChange = (source, field, value) => {
      setFormData(prev => ({
        ...prev,
        bookValues: {
          ...prev.bookValues,
          [source]: {
            ...prev.bookValues[source],
            [field]: value
          }
        }
      }));
    };

    const handleInspectionChange = (item, value) => {
      setFormData(prev => ({
        ...prev,
        inspection: {
          ...prev.inspection,
          [item]: {
            ...prev.inspection[item],
            condition: value
          }
        }
      }));
    };

      const handleSubmit = async (e) => {
        e.preventDefault();

        try {
          const response = await fetch(`/api/tradein/deal/${dealId}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
          });

          if (response.ok) {
            const savedTradeIn = await response.json();

            // Upload photos if any
            if (photos.length > 0 && savedTradeIn._id) {
              for (const photo of photos) {
                if (photo.isLocal) {
                  try {
                    await fetch(`/api/tradein/${savedTradeIn._id}/photos`, {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json'
                      },
                      body: JSON.stringify({
                        url: photo.url,
                        caption: photo.caption || ''
                      })
                    });
                  } catch (photoError) {
                    console.error('Failed to upload photo:', photoError);
                  }
                }
              }
            }

            onSave(savedTradeIn);
            onClose();
          } else {
            console.error('Failed to save trade-in');
          }
        } catch (error) {
          console.error('Error saving trade-in:', error);
        }
      };

    const needsApproval = () => {
      return calculations.overAllowance > 1000 ||
             calculations.equity < -5000 ||
             formData.condition === 'poor';
    };

    return (
      <div className="trade-in-form-overlay">
        <div className="trade-in-form">
          <div className="trade-in-form-header">
            <h2>Trade-In Evaluation</h2>
            <button onClick={onClose} className="close-btn">
              <X size={20} />
            </button>
          </div>

          <div className="trade-in-tabs">
            <button
              className={`tab ${activeTab === 'vehicle' ? 'active' : ''}`}
              onClick={() => setActiveTab('vehicle')}
            >
              <Car size={16} /> Vehicle Info
            </button>
            <button
              className={`tab ${activeTab === 'values' ? 'active' : ''}`}
              onClick={() => setActiveTab('values')}
            >
              <DollarSign size={16} /> Values
            </button>
            <button
              className={`tab ${activeTab === 'books' ? 'active' : ''}`}
              onClick={() => setActiveTab('books')}
            >
              <FileText size={16} /> Book Values
            </button>
            <button
                className={`tab ${activeTab === 'photos' ? 'active' : ''}`}
                onClick={() => setActiveTab('photos')}
              >
                <Camera size={16} /> Photos
              </button>
              <button
                className={`tab ${activeTab === 'inspection' ? 'active' : ''}`}
                onClick={() => setActiveTab('inspection')}
              >

              <AlertTriangle size={16} /> Inspection
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            {activeTab === 'vehicle' && (
              <div className="tab-content">
                <div className="form-grid">
                  <div className="form-group">
                    <label>VIN</label>
                    <input
                      type="text"
                      name="vin"
                      value={formData.vin}
                      onChange={handleInputChange}
                      placeholder="Enter VIN"
                    />
                  </div>
                  <div className="form-group">
                    <label>Year*</label>
                    <input
                      type="number"
                      name="year"
                      value={formData.year}
                      onChange={handleInputChange}
                      required
                      min="1900"
                      max={new Date().getFullYear() + 1}
                    />
                  </div>
                  <div className="form-group">
                    <label>Make*</label>
                    <input
                      type="text"
                      name="make"
                      value={formData.make}
                      onChange={handleInputChange}
                      required
                      placeholder="e.g. Ford"
                    />
                  </div>
                  <div className="form-group">
                    <label>Model*</label>
                    <input
                      type="text"
                      name="model"
                      value={formData.model}
                      onChange={handleInputChange}
                      required
                      placeholder="e.g. F-150"
                    />
                  </div>
                  <div className="form-group">
                    <label>Trim</label>
                    <input
                      type="text"
                      name="trim"
                      value={formData.trim}
                      onChange={handleInputChange}
                      placeholder="e.g. XLT"
                    />
                  </div>
                  <div className="form-group">
                    <label>Mileage*</label>
                    <input
                      type="number"
                      name="mileage"
                      value={formData.mileage}
                      onChange={handleInputChange}
                      required
                      placeholder="e.g. 45000"
                    />
                  </div>
                  <div className="form-group">
                    <label>Exterior Color</label>
                    <input
                      type="text"
                      name="exteriorColor"
                      value={formData.exteriorColor}
                      onChange={handleInputChange}
                      placeholder="e.g. Silver"
                    />
                  </div>
                  <div className="form-group">
                    <label>Interior Color</label>
                    <input
                      type="text"
                      name="interiorColor"
                      value={formData.interiorColor}
                      onChange={handleInputChange}
                      placeholder="e.g. Black"
                    />
                  </div>
                  <div className="form-group full-width">
                    <label>Overall Condition*</label>
                    <select
                      name="condition"
                      value={formData.condition}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="excellent">Excellent</option>
                      <option value="good">Good</option>
                      <option value="fair">Fair</option>
                      <option value="poor">Poor</option>
                    </select>
                  </div>
                  <div className="form-group full-width">
                    <label>Condition Notes</label>
                    <textarea
                      name="conditionNotes"
                      value={formData.conditionNotes}
                      onChange={handleInputChange}
                      placeholder="Any specific damage, issues, or notes..."
                      rows="3"
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'values' && (
              <div className="tab-content">
                <div className="value-calculations">
                  <div className="form-grid">
                    <div className="form-group">
                      <label>ACV (Actual Cash Value)*</label>
                      <input
                        type="number"
                        name="acv"
                        value={formData.acv}
                        onChange={handleInputChange}
                        required
                        placeholder="What it's worth to dealer"
                      />
                    </div>
                    <div className="form-group">
                      <label>Customer Allowance*</label>
                      <input
                        type="number"
                        name="allowance"
                        value={formData.allowance}
                        onChange={handleInputChange}
                        required
                        placeholder="What customer gets"
                      />
                    </div>
                    <div className="form-group">
                      <label>Payoff Amount</label>
                      <input
                        type="number"
                        name="payoff"
                        value={formData.payoff}
                        onChange={handleInputChange}
                        placeholder="What customer owes"
                      />
                    </div>
                  </div>

                  <div className="calculation-results">
                    <div className={`calc-item ${calculations.overAllowance > 500 ? 'alert' : ''}`}>
                      <span>Over/Under Allowance:</span>
                      <strong>${calculations.overAllowance.toLocaleString()}</strong>
                    </div>
                    <div className={`calc-item ${calculations.equity < -1000 ? 'alert' : ''}`}>
                      <span>Customer Equity:</span>
                      <strong>${calculations.equity.toLocaleString()}</strong>
                    </div>
                    <div className="calc-item">
                      <span>Gross Impact:</span>
                      <strong className={calculations.grossImpact < 0 ? 'negative' : 'positive'}>
                        ${calculations.grossImpact.toLocaleString()}
                      </strong>
                    </div>
                    {calculations.averageBookValue > 0 && (
                      <div className="calc-item">
                        <span>Avg Book Value:</span>
                        <strong>${calculations.averageBookValue.toLocaleString()}</strong>
                      </div>
                    )}
                  </div>

                  {needsApproval() && (
                    <div className="approval-alert">
                      <AlertTriangle size={20} />
                      <span>This trade requires manager approval</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'books' && (
              <div className="tab-content">
                <div className="book-values">
                  <div className="book-section">
                    <h3>NADA Guides</h3>
                    <div className="book-inputs">
                      <input
                        type="number"
                        placeholder="Clean"
                        value={formData.bookValues.nada.clean}
                        onChange={(e) => handleBookValueChange('nada', 'clean', e.target.value)}
                      />
                      <input
                        type="number"
                        placeholder="Average"
                        value={formData.bookValues.nada.average}
                        onChange={(e) => handleBookValueChange('nada', 'average', e.target.value)}
                      />
                      <input
                        type="number"
                        placeholder="Rough"
                        value={formData.bookValues.nada.rough}
                        onChange={(e) => handleBookValueChange('nada', 'rough', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="book-section">
                    <h3>Kelley Blue Book</h3>
                    <div className="book-inputs">
                      <input
                        type="number"
                        placeholder="Trade-In"
                        value={formData.bookValues.kbb.tradein}
                        onChange={(e) => handleBookValueChange('kbb', 'tradein', e.target.value)}
                      />
                      <input
                        type="number"
                        placeholder="Private"
                        value={formData.bookValues.kbb.private}
                        onChange={(e) => handleBookValueChange('kbb', 'private', e.target.value)}
                      />
                      <input
                        type="number"
                        placeholder="Dealer"
                        value={formData.bookValues.kbb.dealer}
                        onChange={(e) => handleBookValueChange('kbb', 'dealer', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="book-section">
                    <h3>Black Book</h3>
                    <div className="book-inputs">
                      <input
                        type="number"
                        placeholder="Clean"
                        value={formData.bookValues.blackbook.clean}
                        onChange={(e) => handleBookValueChange('blackbook', 'clean', e.target.value)}
                      />
                      <input
                        type="number"
                        placeholder="Average"
                        value={formData.bookValues.blackbook.average}
                        onChange={(e) => handleBookValueChange('blackbook', 'average', e.target.value)}
                      />
                      <input
                        type="number"
                        placeholder="Rough"
                        value={formData.bookValues.blackbook.rough}
                        onChange={(e) => handleBookValueChange('blackbook', 'rough', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="book-section">
                    <h3>vAuto</h3>
                    <div className="book-inputs">
                      <input
                        type="number"
                        placeholder="Market Value"
                        value={formData.bookValues.vauto.marketValue}
                        onChange={(e) => handleBookValueChange('vauto', 'marketValue', e.target.value)}
                      />
                      <input
                        type="number"
                        placeholder="Avg Market"
                        value={formData.bookValues.vauto.avgMarketPrice}
                        onChange={(e) => handleBookValueChange('vauto', 'avgMarketPrice', e.target.value)}
                      />
                      <input
                        type="number"
                        placeholder="Days Supply"
                        value={formData.bookValues.vauto.daysSupply}
                        onChange={(e) => handleBookValueChange('vauto', 'daysSupply', e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'inspection' && (
              <div className="tab-content">
                <div className="inspection-grid">
                  {Object.entries(formData.inspection).map(([item, data]) => (
                    <div key={item} className="inspection-item">
                      <label>{item.charAt(0).toUpperCase() + item.slice(1)}</label>
                      <select
                        value={data.condition}
                        onChange={(e) => handleInspectionChange(item, e.target.value)}
                      >
                        <option value="excellent">Excellent</option>
                        <option value="good">Good</option>
                        <option value="fair">Fair</option>
                        <option value="poor">Poor</option>
                      </select>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'photos' && (
                <div className="tab-content">
                  <PhotoUpload
                    photos={photos}
                    onPhotosChange={setPhotos}
                    maxPhotos={10}
                  />
                </div>
              )}

            <div className="form-actions">
              <button type="button" onClick={onClose} className="cancel-btn">
                Cancel
              </button>
              <button type="submit" className="save-btn">
                <Save size={16} /> Save Trade-In
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  export default TradeInForm;
