import React from "react";
import { useNavigate } from "react-router-dom";


function TuringTest() {
    const navigate = useNavigate();
    return(
        <div>
            <h1>About Turing Test</h1>
            <h3>The Turing Test is a concept introduced by British mathematician
                and computer scientist Alan Turing in 1950 as a way to assess a
                machine's ability to exhibit intelligent behavior indistinguishable
                from that of a human. </h3>
            <h2>How it works?</h2>
            <img src="/fota.jpg" alt="Fota" />
            <h3>The test is conducted in the form of a
                conversation: a human judge engages in a text-based exchange with
                both a machine (often an AI) and another human, without knowing
                which is which. If the judge cannot reliably tell the difference
                between the human and the machine based solely on their responses,
                the machine is said to have "passed" the Turing Test.</h3>

            <h3>The Turing Test has become a foundational idea in the field
                of artificial intelligence (AI), representing one of the first
                formal attempts to explore machine intelligence. The test is not
                about measuring intelligence directly but rather assessing
                the machine's ability to mimic human-like responses convincingly.
                While some AI systems today can perform well on limited conversational
                tasks, the Turing Test remains a high bar, especially in terms of
                achieving nuanced, contextually appropriate responses across diverse
                topics.</h3>

            <button onClick={() => navigate("/")}>Go back</button>
        </div>



    );
}
export default TuringTest;