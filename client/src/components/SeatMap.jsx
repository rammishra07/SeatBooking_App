import React from "react";

export default function SeatMap({ seats = [], selectedSeats = [], onToggleSeat, maxSeats = 10 }) {
  // Group seats by row
  const rows = {};
  seats.forEach((seat) => {
    const row = seat.row || (seat.seatNumber ? seat.seatNumber.charAt(0) : "A");
    if (!rows[row]) rows[row] = [];
    rows[row].push(seat);
  });

  // Sort rows alphabetically
  const sortedRowKeys = Object.keys(rows).sort();

  const handleSeatClick = (seat) => {
    if (seat.isBooked) return;
    const isSelected = selectedSeats.includes(seat.seatNumber);
    if (!isSelected && selectedSeats.length >= maxSeats) {
      alert(`You can select up to ${maxSeats} seats per booking.`);
      return;
    }
    onToggleSeat(seat.seatNumber);
  };

  return (
    <div className="seat-map-container">
      {/* Stage visual */}
      <div className="stage-area">
        <div className="stage-curve">STAGE / SCREEN</div>
        <p className="stage-hint">All eyes this way</p>
      </div>

      {/* Legend */}
      <div className="seat-legend">
        <div className="legend-item">
          <span className="legend-box seat-available"></span>
          <span>Available</span>
        </div>
        <div className="legend-item">
          <span className="legend-box seat-selected"></span>
          <span>Selected</span>
        </div>
        <div className="legend-item">
          <span className="legend-box seat-booked"></span>
          <span>Booked</span>
        </div>
      </div>

      {/* Seat grid */}
      <div className="seat-grid">
        {sortedRowKeys.map((rowKey) => {
          // Sort seats by seat number within row
          const rowSeats = rows[rowKey].sort((a, b) => a.number - b.number);
          return (
            <div key={rowKey} className="seat-row">
              <span className="row-label">{rowKey}</span>
              <div className="row-seats">
                {rowSeats.map((seat) => {
                  const isSelected = selectedSeats.includes(seat.seatNumber);
                  let seatClass = "seat-btn";

                  if (seat.isBooked) {
                    seatClass += " booked";
                  } else if (isSelected) {
                    seatClass += " selected";
                  } else {
                    seatClass += " available";
                  }

                  return (
                    <button
                      key={seat.seatNumber}
                      type="button"
                      disabled={seat.isBooked}
                      onClick={() => handleSeatClick(seat)}
                      className={seatClass}
                      title={`Seat ${seat.seatNumber} - ${seat.isBooked ? "Booked" : isSelected ? "Selected" : "Available"}`}
                      aria-label={`Seat ${seat.seatNumber} ${seat.isBooked ? "booked" : isSelected ? "selected" : "available"}`}
                    >
                      {seat.number}
                    </button>
                  );
                })}
              </div>
              <span className="row-label">{rowKey}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
