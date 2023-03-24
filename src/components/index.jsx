import { createElement, ReactElement, Component } from "react";
import { ListBoxComponent } from "@syncfusion/ej2-react-dropdowns";
import "./CustomColumnPicker.css";


const Actions = {
    moveTo: "moveTo",
    moveAllTo: "moveAllTo",
    moveFrom: "moveFrom",
    moveAllFrom: "moveAllFrom"
}

const toolbarSettings = {
    items: [
        "moveUp",
        "moveDown",
        "moveTo",
        "moveFrom",
        "moveAllTo",
        "moveAllFrom",
    ],

};
const noRecordsTemplate = '<div class="e-list-nrt"><span>NO DATA AVAILABLE</span></div>';

export default class CustomColumnPicker extends Component {
    constructor(props) {
        super(props);
        this.state = {
            selectedColumns: [],
            columnsList: [],
            fields: { text: "label" },
            shouldRefreshComponent: false

        };
    }

    _resolveLoadOptions;
    _waitAnotherPropsUpdate;

    componentDidUpdate(prevProps) {
        if (
            prevProps.options !== this.props.options &&
            this.props.options.status === "available"
        ) {
            this.setState({
                selectedColumns: [],
                shouldRefreshComponent: true
            })
            this.getOptions().then(options => {
                const items = this.props.columnsToIncludeInReport.value.split(",").map(x => x.trim());
                if (items.length > 0 && items[0] !== "") {
                    const selectedOptions = options.filter((el) => items.includes(el.value));
                    const filteredSelectedColumns = options.filter((el) => !items.includes(el.value));
                    this.setState({
                        selectedColumns: this.props.isDefault.value ? [] : [...selectedOptions],
                        columnsList: this.props.isDefault.value ? [...selectedOptions] : [...filteredSelectedColumns],
                        shouldRefreshComponent: false
                    })
                } else {
                    this.setState({
                        columnsList: options,
                        shouldRefreshComponent: false
                    })
                    this.props.columnsToIncludeInReport.setValue(options.map(x => x.value).join(", "));
                }
            })
        }

        if (this.props.isDefault.value !== prevProps.isDefault.value) {
            if (this.props.isDefault.value === true) {
                let options = [];
                this.setState({
                    selectedColumns: [],
                    shouldRefreshComponent: true
                })
                if (this.props.options && this.props.options.status === "available") {
                    options = this.props.options.items.map(obj => {
                        return this.getLabelValuesOption(obj);
                    });
                }
                setTimeout(() => {
                    this.setState({
                        columnsList: options,
                        selectedColumns: [],
                        shouldRefreshComponent: false
                    })
                }, 50)
                this.props.columnsToIncludeInReport.setValue(options.map(x => x.value).join(", "));
            }
        }
    }

    // https://reactjs.org/docs/react-component.html#unsafe_componentwillreceiveprops
    // will work in version 17.
    // eventually this has to be migrated to memoization helper with useMemo.
    async UNSAFE_componentWillReceiveProps(nextProps) {
        if (this._waitAnotherPropsUpdate) {
            this._waitAnotherPropsUpdate = false;
            return;
        }
        const options = this.getOptions(nextProps);
        this._resolveLoadOptions && this._resolveLoadOptions(await options);
        this._resolveLoadOptions = null;
    }

    getLabelValuesOption = (obj) => {
        const option = {
            value: this.getAttributeValue(this.props.valueAttribute, obj),
            label: this.getAttributeValue(this.props.displayAttribute, obj)
        }
        return option;
    };

    getAttributeValue = (attribute, obj) =>
        // Accessing an attribute from the list item directly is deprecated since mx9,
        // but the get() function doesn't yet exist yet in mx8. Thats why we have this check,
        // to have the widget work in both versions.
        attribute && ("get" in attribute ? attribute.get(obj).displayValue : attribute(obj).displayValue);


    handleChange = (e) => {
        switch (e.eventName) {
            case Actions.moveTo: {
                const colunns = [...this.state.selectedColumns];
                this.setState({
                    selectedColumns: [...colunns, ...e.items],
                })
                this.props.columnsToIncludeInReport.setValue([...colunns, ...e.items].map(x => x.value).join(", "));
                break;
            }
            case Actions.moveAllTo: {
                const colunns = [...this.state.selectedColumns];
                this.setState({
                    selectedColumns: [...colunns, ...e.items],
                })
                this.props.columnsToIncludeInReport.setValue([...colunns, ...e.items].map(x => x.value).join(", "));
                break;
            }
            case Actions.moveFrom: {
                const filteredSelectedColumns = this.state.selectedColumns.filter((el) => !e.items.map(x => x.value).includes(el.value));
                this.setState({
                    selectedColumns: [...filteredSelectedColumns],
                })
                this.props.columnsToIncludeInReport.setValue([...filteredSelectedColumns].map(x => x.value).join(", "));
                break;
            }
            case Actions.moveAllFrom: {
                this.setState({
                    selectedColumns: [],
                })
                this.props.columnsToIncludeInReport.setValue(this.state.columnsList.map(x => x.value).join(", "));
                break;
            }
            default: {
            }
        }
    };

    waitUntil = condition => {
        return new Promise(resolve => {
            const interval = setInterval(() => {
                if (!condition()) {
                    return;
                }
                clearInterval(interval);
                resolve();
            }, 100);
        });
    };

    getOptions = async (props = this.props) => {
        const startTime = Date.now();
        await this.waitUntil(() => props.options.status !== "loading" || Date.now() > startTime + 500);
        if (!props.options || props.options.status !== "available") {
            return [];
        }
        return props.options.items.map(obj => {
            return this.getLabelValuesOption(obj);
        });
    };

    render() {
        return (
            this.state.shouldRefreshComponent ? null : <div className='control-pane'>
                <div className="control-section">
                    {
                        this.props.isDefault.value === false ? <div className="dual-list-wrapper">
                            <div className="dual-list-groupa">
                                <p>Available Columns</p>
                                <ListBoxComponent actionComplete={this.handleChange} dataSource={this.state.columnsList} fields={this.state.fields} height="330px" scope="#combined-listbox" toolbarSettings={toolbarSettings} noRecordsTemplate={noRecordsTemplate} />
                            </div>
                            <div className="dual-list-groupb">
                                <p>Columns to Display in Report</p>
                                <ListBoxComponent actionComplete={this.handleChange} id="combined-listbox" dataSource={this.state.selectedColumns} height="330px" fields={this.state.fields} noRecordsTemplate={noRecordsTemplate} />
                            </div>
                        </div> : <div className="dual-list-wrapper">
                            <div className="dual-list-groupa">
                                <p>Columns to Display in Report</p>
                                <ListBoxComponent id="combined-listbox" dataSource={this.state.columnsList} fields={this.state.fields} height="330px" toolbarSettings={{ items: [] }} />
                            </div>
                        </div>
                    }
                </div>
            </div>
        );
    }
}