import { useState } from "react";
import jsPDF from "jspdf";
import { MdDeleteOutline } from "react-icons/md";
import html2canvas from "html2canvas";
import "./preview.css";

const Preview = ({ initialData, setOutput }) => {
  const [data, setData] = useState(initialData);
  const [imageSrc, setImageSrc] = useState(null);
  const [theImgSrc, setTheImgSrc] = useState(null);
  const [showOptions, setShowOptions] = useState(false);
  const [showOption, setShowOption] = useState();
  const [selectedDatabaseImage, setSelectedDatabaseImage] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [address, setAddress] = useState("");
  const [solution, setSolution] = useState("");
  const [charges, setCharges] = useState("");
  const [signatureSrc, setSignatureSrc] = useState(null);
  const [date, setDate] = useState("");
  const [selectedOption, setSelectedOption] = useState("");
  const [selectedRequirement, setSelectedRequirement] = useState("");
  const [requirementText, setRequirementText] = useState("");

  const updateRequirementText = (newText) => {
    setRequirementText(newText);
  };

  const databaseImages = [
    {
      topic: "Sample 1",
      url: "/sample1.avif",
    },
    {
      topic: "Sample 2",
      url: "/sample2.jpg",
    },
    {
      topic: "Sample 3",
      url: "/sample3.avif",
    },
  ];

  const options = [
    { type: "sample1", description: "This is a sample data solution" },
    { type: "sample2", description: "Another sample description" },
  ];

  const sampleOptions = [
    { type: "sample1", description: "This is a sample data solution" },
    { type: "sample2", description: "This is another sample description" },
    { type: "sample3", description: "Additional sample for selection" },
  ];

  const handleSignatureChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        setSignatureSrc(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };
  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        setImageSrc(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleOtherImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        setTheImgSrc(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDatabaseImageSelect = (url) => {
    setImageSrc(url);
    setShowOptions(false);
  };

  const handleOtherDatabaseImageSelect = (url) => {
    setTheImgSrc(url);
    setShowOption(false);
  };

  const handleTextDropdownChange = (e) => {
    const selectedType = e.target.value;
    setSelectedOption(selectedType);

    // Find the selected option's description
    const selectedData = options.find((option) => option.type === selectedType);
    if (selectedData) {
      handleInputChange("ProjectScope", selectedData.description); // Update the data with the selected description
    }
  };

  function clearImage() {
    setImageSrc(null);
    setShowOptions(false);
  }

  function clearOtherImage() {
    setTheImgSrc(null);
    setShowOption(false);
  }

  const handleDropdownChange = (e) => {
    const selectedImage = databaseImages.find(
      (img) => img.topic === e.target.value
    );
    if (selectedImage) {
      handleDatabaseImageSelect(selectedImage.url);
    }
  };

  const handleOtherDropdownChange = (e) => {
    const selectedImage = databaseImages.find(
      (img) => img.topic === e.target.value
    );
    if (selectedImage) {
      handleOtherDatabaseImageSelect(selectedImage.url);
    }
  };
  const handleInputChange = (field, value) => {
    setData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleEditChange = (section, index, key, value) => {
    setOutput((prev) => {
      const updated = { ...prev };
      if (section === "solutionBOQ" || section === "optionalItems") {
        updated[section][index][key] = value;
      }
      return updated;
    });
  };

  const renderEditableTable = (data, sectionName) => {
    return (
      <div>
        <h3>{sectionName}</h3>
        <table>
          <thead>
            <tr>
              {Object.keys(data[0]).map((key) => (
                <th key={key}>{key}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((item, index) => (
              <tr key={index}>
                {Object.keys(item).map((key) => (
                  <td key={key}>
                    <input
                      type="text"
                      value={item[key] || ""}
                      onChange={(e) =>
                        handleEditChange(
                          sectionName,
                          index,
                          key,
                          e.target.value
                        )
                      }
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const generatePDF = async () => {
    // Select all the input and textarea elements to change the border color
    const inputs = document.querySelectorAll(
      ".business-proposal input[type='text'], .business-proposal textarea"
    );

    const buttons = document.querySelectorAll(
      ".image-button ,.delete-btn,select"
    );

    // Temporarily change the border color to white
    inputs.forEach((input) => {
      input.style.borderBottomColor = "white";
    });

    buttons.forEach((button) => {
      button.style.display = "none";

      // Hide the buttons
    });

    const doc = new jsPDF();
    const sections = document.querySelectorAll(".business-proposal > section");

    for (let i = 0; i < sections.length; i++) {
      const section = sections[i];

      // Generate canvas with a smaller scale to reduce image resolution
      const canvas = await html2canvas(section, {
        scale: 1.5, // Lower scale for smaller file size (default is 2)
        useCORS: true, // Handle images from external sources
      });

      // Convert canvas to JPEG and adjust compression quality
      const imgData = canvas.toDataURL("image/jpeg", 0.7); // Reduce quality (0.1 to 1)

      // Calculate dimensions to fit A4 size
      const imgWidth = 190; // Max width for A4
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      if (i > 0) doc.addPage();
      doc.addImage(imgData, "JPEG", 10, 10, imgWidth, imgHeight); // Use JPEG instead of PNG
    }

    // Revert the border color back to the original after generating the PDF
    inputs.forEach((input) => {
      input.style.borderBottomColor = ""; // Resets to the original style
    });

    // Save the PDF
    doc.save("business-proposal.pdf");
  };

  return (
    <div className="business-proposal">
      <button onClick={generatePDF} style={{ marginBottom: "20px" }}>
        Generate PDF
      </button>
      <section id="cover-page">
        <h2>Cover Page</h2>
        <label htmlFor="customerName">Business Proposal for</label>
        <input
          style={{ width: 250 }}
          type="text"
          className="customerName"
          value={data.customerName}
          onChange={(e) => handleInputChange("customerName", e.target.value)}
        />
        <br />
        <label htmlFor="referenceNumber">referenceNumber:</label>
        <input
          style={{ width: 250 }}
          type="text"
          className="referenceNumber"
          value={data.referenceNumber}
          onChange={(e) => handleInputChange("referenceNumber", e.target.value)}
        />
      </section>
      <section id="contents">
        <h2>Contents</h2>
        <p>A table of contents listing all sections of the proposal:</p>
        <ul>
          <li>Company Overview - Page 4</li>
          <li>Our Strengths - Page 5</li>
          <li>Why with Us - Page 6</li>
          <li>Your Requirements - Page 7</li>
          <li>Proposed Solution and Network Architecture - Pages 8–9</li>
          <li>Your Investment - Page 10</li>
          <li>Terms & Conditions - Page 11</li>
          <li>Customer Acknowledgements - Page 12</li>
          <li>SME Solutions - Page 13</li>
          <li>Awards and Accolades - Page 14</li>
          <li>Contact Us - Page 15</li>
        </ul>
      </section>
      <section className="introduction">
        <h1>Enterprise Business Proposal</h1>
        <p>{new Date().toISOString().split("T")[0]}</p>
        <p>
          <strong>
            {" "}
            <input
              style={{ width: 250 }}
              type="text"
              className="customerName"
              value={data.customerName}
              onChange={(e) =>
                handleInputChange("customerName", e.target.value)
              }
            />
          </strong>
          <br />
          <strong>
            {" "}
            <input
              style={{ width: 250 }}
              type="text"
              className="designation"
              value={data.designation}
              onChange={(e) => handleInputChange("designation", e.target.value)}
            />
          </strong>
          <br />
          <strong>
            {" "}
            <input
              style={{ width: 250 }}
              type="text"
              className="companyName"
              value={data.companyName}
              onChange={(e) => handleInputChange("companyName", e.target.value)}
            />
          </strong>
          <br />
          <strong>
            {" "}
            <input
              style={{ width: 250 }}
              type="text"
              className="addressLine"
              value={data.addressLine}
              onChange={(e) => handleInputChange("addressLine", e.target.value)}
            />
          </strong>
          <br />
          {/* {formData.addressLine2} */}
        </p>
        <p>Dear Sir/Madam,</p>
        <h2>Business Proposal for {initialData.customerName}</h2>
        <p>
          We understand that every organisation needs to create an edge to
          succeed in the current complex business environment and how technology
          could help to achieve this. That is why we at SLT-MOBITEL, have
          created a suite of customisable and scalable intelligent enterprise
          solutions designed to help you make that crucial leap to take your
          business beyond where it can be to where it should be.
        </p>
        <p>
          As we combine the strength of fixed and mobile, we pride ourselves on
          our unmatched enterprise capabilities and expert experience spanning
          for decades. Moreover, we have dedicated Account Managers at your
          service, ensuring we are not only your provider but also your partner
          in progress.
        </p>
        <p>
          We are pleased to submit the attached proposal for
          {data.solutionBOQ[0].Item}. Our proposal briefs on
          {
            <>
              {/* Dropdown for selecting description */}
              {
                <select
                  className="dropdown"
                  value={selectedOption}
                  onChange={handleTextDropdownChange}
                >
                  <option value="" disabled>
                    Select an option
                  </option>
                  {options.map((option) => (
                    <option key={option.type} value={option.type}>
                      {option.type}
                    </option>
                  ))}
                </select>
              }
              <textarea
                className="text-box"
                placeholder="................................................................................................................................................................................................................................................................................................................................................................................................................................................"
                value={data.ProjectScope}
                onChange={(e) =>
                  handleInputChange("ProjectScope", e.target.value)
                }
              />
            </>
          }
          .
        </p>
        <p>
          We look forward to discussing the proposal in detail. Do not hesitate
          to reach out to {initialData.contactName} on{" "}
          {initialData.contactNumber} should you require any assistance.
        </p>
        <p>
          We are committed to partnering with you in your journey to success and
          look forward to empowering your business with our intelligent business
          solutions.
        </p>
        <p>Thank you</p>
        <p>Yours sincerely,</p>
        <p>.....................................................</p>
      </section>
      <section id="company-overview">
        <h2>Company Overview</h2>
        <p>
          SLT-MOBITEL, has been instrumental in inspiring the vision and growth
          of Sri Lanka’s economy and technological advancement as the national
          Information and Communications Technology (ICT) solutions provider.
          With the power of fixed and mobile, we provide a range of
          comprehensive tech driven products, services, and solutions to
          complement evolving digital lifestyles. We take pride in serving over
          nine million customers across the island through our high-speed
          network of fibre, copper, and mobile access, Furthermore, through the
          international submarine cable system, SLT-MOBITEL has connected Sri
          Lanka to the world there by creating numerous global opportunities.
        </p>
        <p>
          Apart from fixed and mobile telephony, broadband, data services and
          Internet Protocol Television (IPTV), SLT-MOBITEL is at the forefront
          of integrating the latest technologies to deliver diversified ICT
          solutions for the enterprise segment such as cloud computing, hosting
          services, and advanced networking solutions enabling local enterprises
          and small and medium- sized enterprises (SMEs) to access growth
          potential in both local and global markets.
        </p>
        <p>
          The company's widespread presence across the island, with regional
          telecommunication offices, Teleshops, and an extensive dealer and
          reseller network, ensures that customers, irrespective of their
          location, can easily access its services. This extensive reach
          benefits a vast array of customers ranging from domestic users, SMEs,
          and retail customers to multinational corporations, enterprises and
          public sector institutions.
        </p>

        <p>
          Drawing upon its legacy of 165+ years, SLT-MOBITEL is ready to meet
          the challenges of the Nation’s digitalisation process and the emerging
          digital economy head-on. It has strengthened its commitment to
          providing lifestyle services to customers and delivering world-class
          platforms and solutions to enterprises. By leveraging this wealth of
          experience, SLT-MOBITEL continues to offer unparalleled solutions,
          perfectly poised to revolutionise the SME sector and drive its
          participation in the global digital economy.
        </p>
      </section>

      <section id="our-strengths">
        <h2>Our Strengths</h2>
        <p>
          Highlights of SLT-MOBITEL's experience, technical expertise, reliable
          infrastructure, and financial viability.
        </p>
        <img src="/proposal.png" style={{ width: 640 }} alt="Strengths" />
      </section>

      <section id="why-with-us">
        <h2>Why with Us</h2>
        <img src="/diagram.png" style={{ width: 640 }} alt="Strengths" />
      </section>

      <section className="requirements">
        <h2>Requirements Section</h2>
        <p>
          Please provide your requirements below. You can either type them
          manually or select from the options provided.
        </p>

        <div className="requirement-text">
          <label htmlFor="requirementTextarea">Requirements:</label>
          <div className="requirement-input">
            {!requirementText && (
              <select
                id="requirementDropdown"
                className="dropdown"
                value={selectedRequirement} // Updated state variable
                onChange={(e) => {
                  const selectedValue = e.target.value;
                  setSelectedRequirement(selectedValue); // Updated function
                  const foundDescription = sampleOptions.find(
                    (option) => option.type === selectedValue
                  )?.description; // Match description
                  updateRequirementText(foundDescription || ""); // Updated function
                }}
              >
                <option value="" disabled>
                  Select an option
                </option>
                {sampleOptions.map((option) => (
                  <option key={option.type} value={option.type}>
                    {option.type}
                  </option>
                ))}
              </select>
            )}
          </div>
          <textarea
            id="requirementTextarea"
            className="text-box"
            value={requirementText} // Updated state variable
            onChange={(e) => updateRequirementText(e.target.value)} // Updated function
            placeholder="Type your requirement here..."
          />
        </div>

        {!theImgSrc && (
          <button
            className="image-button"
            onClick={() => setShowOption(true)}
            style={{
              backgroundColor: "#007BFF",
              color: "white",
              padding: "10px 20px",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
            }}
          >
            Add Image
          </button>
        )}

        {showOption && (
          <div className="options-modal">
            <button
              onClick={() => document.getElementById("imageInput").click()}
              style={{
                backgroundColor: "#007BFF",
                color: "white",
                padding: "10px 20px",
                border: "none",
                borderRadius: "5px",
                cursor: "pointer",
                marginRight: "10px",
              }}
            >
              Upload from PC
            </button>

            <select
              onChange={handleOtherDropdownChange}
              style={{
                backgroundColor: "#007BFF",
                color: "white",
                padding: "10px 20px",
                border: "none",
                borderRadius: "5px",
                cursor: "pointer",
              }}
            >
              <option value="">Select from Database</option>
              {databaseImages.map((image, index) => (
                <option key={index} value={image.topic}>
                  {image.topic}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Hidden file input */}
        <input
          type="file"
          id="imageInput"
          accept="image/*"
          style={{ display: "none" }}
          onChange={handleOtherImageChange}
        />

        {/* Display the uploaded image */}
        <div style={{ marginTop: "20px" }}>
          {theImgSrc && (
            <MdDeleteOutline className="delete-btn" onClick={clearOtherImage} />
          )}
          {theImgSrc && (
            <img
              src={theImgSrc}
              alt="Uploaded Preview"
              style={{
                maxWidth: "100%",
                marginTop: "10px",
                borderRadius: "5px",
              }}
            />
          )}
        </div>
      </section>

      {/* <section id="proposed-solution">
        <h2>Proposed Solution</h2>
        <p>
          Includes an overview of the proposed network architecture and other
          technical solutions. This section can have diagrams or predefined
          templates.
        </p>
      </section> */}

      <section id="solution-diagram">
        <h2>Solution Diagram</h2>
        <p>
          Detailed explanation and visual representation of the network
          architecture specific to the client's needs.
        </p>

        {/* Add Image Button */}
        {!imageSrc && (
          <button
            className="image-button"
            onClick={() => setShowOptions(true)}
            style={{
              backgroundColor: "#007BFF",
              color: "white",
              padding: "10px 20px",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
            }}
          >
            Add Image
          </button>
        )}

        {showOptions && (
          <div className="options-modal">
            <button
              onClick={() => document.getElementById("imageInput").click()}
              style={{
                backgroundColor: "#007BFF",
                color: "white",
                padding: "10px 20px",
                border: "none",
                borderRadius: "5px",
                cursor: "pointer",
                marginRight: "10px",
              }}
            >
              Upload from PC
            </button>

            <select
              onChange={handleDropdownChange}
              style={{
                backgroundColor: "#007BFF",
                color: "white",
                padding: "10px 20px",
                border: "none",
                borderRadius: "5px",
                cursor: "pointer",
              }}
            >
              <option value="">Select from Database</option>
              {databaseImages.map((image, index) => (
                <option key={index} value={image.topic}>
                  {image.topic}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Hidden file input */}
        <input
          type="file"
          id="imageInput"
          accept="image/*"
          style={{ display: "none" }}
          onChange={handleImageChange}
        />

        {/* Display the uploaded image */}
        <div style={{ marginTop: "20px" }}>
          {imageSrc && (
            <MdDeleteOutline className="delete-btn" onClick={clearImage} />
          )}
          {imageSrc && (
            <img
              src={imageSrc}
              alt="Uploaded Preview"
              style={{
                maxWidth: "100%",
                marginTop: "10px",
                borderRadius: "5px",
              }}
            />
          )}
        </div>
      </section>
      <section id="your-investment">
        <h2>Your Investment</h2>
        {renderEditableTable(initialData.solutionBOQ, "solutionBOQ")}
      </section>

      <section>
        <h2>Optional items</h2>
        {renderEditableTable(initialData.optionalItems, "optionalItems")}
      </section>

      <section id="terms-and-conditions">
        <h2>Terms & Conditions</h2>
        <p>{data.termsAndConditions[1]}</p>
        <p>{data.termsAndConditions[2]}</p>
        <p>{data.termsAndConditions[3]}</p>
        <p>{data.termsAndConditions[4]}</p>
        <p>{data.termsAndConditions[5]}</p>
        <p>{data.termsAndConditions[6]}</p>
        <p>{data.termsAndConditions[7]}</p>
      </section>
      {data.termsAndConditions.length > 6 && (
        <section id="other-remarks">
          <h2>Other Remarks</h2>
          <p>{data.termsAndConditions[8]}</p>
          <p>{data.termsAndConditions[9]}</p>
        </section>
      )}

      <section id="customer-acknowledgements">
        <h2>Customer Acknowledgements</h2>
        <p>
          Regional Enterprise Business Manager
          <br />
          Sri Lanka Telecom PLC
          <br />
          ………………………………………. <br />
          <br />
          Dear Sir/Madam,
          <br />
          We hereby confirmed our acceptance of the proposal submitted on{" "}
          {new Date().toISOString().split("T")[0]}
          under Proposal reference number,
          <br />
          <br />
          <strong>Company Name:</strong>
          <input
            type="text"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            style={{
              border: "none",
              borderBottom: "1px solid #000",
              width: "100%",
              margin: "5px 0",
            }}
          />
          <br />
          <strong>Address:</strong>
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            style={{
              border: "none",
              borderBottom: "1px solid #000",
              width: "100%",
              margin: "5px 0",
            }}
          />
          <br />
          <strong>Solution:</strong>
          <input
            type="text"
            value={solution}
            onChange={(e) => setSolution(e.target.value)}
            style={{
              border: "none",
              borderBottom: "1px solid #000",
              width: "100%",
              margin: "5px 0",
            }}
          />
          <br />
          <strong>Initial & Monthly Charges:</strong>
          <input
            type="text"
            value={charges}
            onChange={(e) => setCharges(e.target.value)}
            style={{
              border: "none",
              borderBottom: "1px solid #000",
              width: "100%",
              margin: "5px 0",
            }}
          />
          <br />
          <br />
          <span style={{ display: "inline-block", width: "50%" }}>
            {signatureSrc ? (
              <img
                src={signatureSrc}
                alt="Signature"
                style={{ maxWidth: "100%", height: "auto", marginTop: "10px" }}
              />
            ) : (
              "…………………………………"
            )}
            <br />
            <label
              htmlFor="signatureInput"
              className="image-button"
              style={{
                display: "inline-block",
                backgroundColor: "#007BFF",
                color: "white",
                padding: "5px 10px",
                borderRadius: "5px",
                cursor: "pointer",
                marginTop: "10px",
              }}
            >
              Upload Signature
            </label>
            <input
              className="image-button"
              type="file"
              id="signatureInput"
              accept="image/*"
              style={{ display: "none" }}
              onChange={handleSignatureChange}
            />
          </span>
          <span
            style={{
              display: "inline-block",
              width: "50%",
              textAlign: "right",
            }}
          >
            <input
              type="text"
              value={new Date().toISOString().split("T")[0]}
              style={{
                border: "none",
                borderBottom: "1px solid #000",
                width: "auto",
                textAlign: "right",
                margin: "5px 0",
              }}
            />
            <br />
            Date
          </span>
        </p>
      </section>

      <section id="sme-solutions">
        <h2>SME Solutions</h2>
        <p>
          COMMUNICATION Ability to stay connected with your customers and
          provide prompt responses are key aspects of customer service to ensure
          no business opportunity is missed. It is important that both internal
          and external communication channels are organised to achieve this, and
          we offer a range of communication solutions from voice to messaging
          over fixed and mobile to help streamline communication.
        </p>
        <p>
          DATA HOSTING, STORAGE & SECURITY Fuel your business growth with
          SLT-MOBITEL's bespoke services from our purpose-built Tier III data
          centre, recognized by the Uptime Institute. Our "Gold Rated" facility,
          certified by the Green Building Council of Sri Lanka, aligns with your
          diverse business requirements, while championing environmental
          sustainability.{" "}
        </p>
        <p>
          <strong>NETWORKING SOLUTIONS</strong>A wide range of networking
          solutions to connect your business to the highest levels of security
          and reliability at the fastest speeds. With multiple access modes, we
          can provide you with multiple high-bandwidth solutions for both
          internet access and Private Network Connections. A wide range of
          networking solutions to connect your business to the highest levels of
          security and reliability at the fastest speeds. With multiple access
          modes, we can provide you with multiple high- bandwidth solutions for
          both internet access and Private Network Connections.
        </p>
        <p>
          IoT SOLUTIONS Unleash the power of connectivity with our IoT
          solutions. Transform your business operations with real-time data,
          enhanced efficiency, and smart automation. From device integration to
          data analytics, we bridge the gap between your business and the
          digital world. Experience the future of intelligent business today
          with our IoT solutions.{" "}
        </p>
        <p>
          SOFTWARE DEVELOPMENT Stay up to date with new tech solutions in
          today's competitive market with SLT-MOBITEL’S affordable, dependable,
          and tailor made Software Solutions. Propel your business to new
          heights in your niche, leveraging our unmatched technological
          expertise.{" "}
        </p>
        <p>
          MARKETING SOLUTIONS Maximise your brand's reach engaging your target
          audience through marketing efforts that deliver impactful results.
          Leverage our comprehensive targeting capabilities and data-driven
          insights. Drive brand awareness, increase conversions, and stay ahead
          in the digital marketing landscape with SLT-MOBITEL.{" "}
        </p>
      </section>

      <section id="awards-and-accolades">
        <h2>Awards and Accolades</h2>
        <p>
          This section should showcase SLT-MOBITEL's achievements and
          recognitions in the industry.
        </p>
        <img
          src="/background.png"
          alt="Awards and Accolades"
          style={{ width: 640 }}
        />
      </section>

      <section id="contact-us">
        <h2>Contact Us</h2>
        <p>
          Primary and secondary contact details, along with general company
          contact information:
        </p>
        <ul>
          <li>Telephone: 0112 389 389</li>
          <li>WhatsApp: 070 500 4000</li>
          <li>Email: bizsolutions@slt.com.lk</li>
          <li>
            Website:{" "}
            <a
              href="http://www.bizleads.slt.lk"
              target="_blank"
              rel="noopener noreferrer"
            >
              www.bizleads.slt.lk
            </a>
          </li>
        </ul>
      </section>
    </div>
  );
};

export default Preview;
