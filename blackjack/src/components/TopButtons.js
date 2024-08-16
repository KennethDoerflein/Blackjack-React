import React from "react";

export default function TopButtons() {
  return (
    <>
      <button type="button" className="px-1 py-1 btn btn-sm btn-dark position-absolute top-0 start-0" data-bs-toggle="modal" data-bs-target="#infoModal">
        ℹ️
      </button>
      <button type="button" className="px-1 py-1 btn btn-sm btn-dark position-absolute top-0 end-0" data-bs-toggle="modal" data-bs-target="#settingsModal">
        ⚙️
      </button>
    </>
  );
}
