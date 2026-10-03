// export default CommandSender
import "../index.css"
import MultiSelect from "./MultiSelect";
import { useState } from "react";
import Select, { MultiValue, OptionProps } from "react-select";

function CommandSender() {

    const [selectedValues, setSelectedValues] = useState<string[]>([]);

    // Added for React Select multi-checkbox dropdown
    const [selectedCars, setSelectedCars] = useState<
        { value: string; label: string }[]
    >([
        { value: "bmw", label: "BMW" },
        { value: "mercedes", label: "Mercedes" },
    ]);

    const carOptions = [
        { value: "audi", label: "Audi" },
        { value: "bmw", label: "BMW" },
        { value: "mercedes", label: "Mercedes" },
        { value: "volvo", label: "Volvo" },
        { value: "lexus", label: "Lexus" },
        { value: "tesla", label: "Tesla" },
    ];

    // Custom option with checkbox
    const Option = (
        props: OptionProps<{ value: string; label: string }, true>
    ) => {
        return (
            <div
                ref={props.innerRef}
                {...props.innerProps}
                style={{
                    display: "flex",
                    alignItems: "center",
                    padding: "8px 12px",
                    backgroundColor: props.isFocused ? "#f0f0f0" : "white",
                    cursor: "pointer",
                }}
            >
                <input
                    type="checkbox"
                    checked={props.isSelected}
                    readOnly
                    style={{ marginRight: "10px" }}
                />
                <label>{props.label}</label>
            </div>
        );
    };

    return (
        <div className="command-sender">
            <h3>Radio Options</h3>
            <p>Frequency</p>
            <div style={{ display: "flex" }}>
                <input type="number" min="1" max="60" />
                <button>Send</button>
            </div>

            <p>Data Types</p>
            <div style={{ display: "flex" }}>
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
            <div style={{ display: "flex" }}>
                <select>

                </select>
                <button>Send</button>
            </div>

            {/* HERE! */}
            <div style={{ padding: "5px" }}></div>

            <div style={{ width: " 200px" }}>
                <Select
                    isMulti
                    options={carOptions}
                    value={selectedCars}
                    onChange={(newValue) =>
                        setSelectedCars(
                            newValue as MultiValue<{
                                value: string;
                                label: string;
                            }> as { value: string; label: string }[]
                        )
                    }
                    closeMenuOnSelect={false}
                    hideSelectedOptions={false}
                    placeholder="Select Cars"
                    components={{ Option }}
                    isSearchable
                    styles={{
                        multiValue: (base) => ({
                            ...base,
                            color: "black",
                            backgroundColor: "#e6f0ff",
                        }),
                        option: (base) => ({
                            ...base,
                            padding: 0,
                        }),
                        menu: (base) => ({
                            ...base,
                            zIndex: 9999,
                            color: "black",
                        }),
                    }}
                />
            </div>
        </div>
    )
}

export default CommandSender