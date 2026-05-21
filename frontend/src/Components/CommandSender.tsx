import "../index.css"
import MultiSelect from "./MultiSelect";
import {  useState } from "react";

function CommandSender(){

    const [selectedValues, setSelectedValues] = useState<string[]>([]);

    return (
        <div className = "command-sender">
            <h3>Radio Options</h3>
            <p>Frequency</p>
            <div style={{display: "flex"}}>
                <input type="number" min="1" max="60"/>
                <button>Send</button>
            </div>
            <p>Data Types</p>
            <div style={{display: "flex"}}>
            <MultiSelect
                options={[
                    { value: "react", label: "React" },
                    { value: "vue", label: "Vue" },
                    { value: "svelte", label: "Svelte" },
                ]}
                placeholder="Select Data Types"
            />
                <button>Send</button>
            </div>
            <p>Command</p>
            <div style={{display: "flex"}}>
                <select>

                </select>
                <button>Send</button>
            </div>

        </div>
    )
}


export default CommandSender