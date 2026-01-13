import { Plugin, UIManager, UIManagerScope, SettingsTypes } from '@ryelite/core';

export default class InventoryCounter extends Plugin {
    pluginName = "Inventory Counter";
    author: string = "Tarocerg";

    private uiManager = new UIManager();
    private inventoryUI: HTMLElement | null = null;
    private inventoryValueUI: HTMLElement | null = null;
    private inventoryIconUI: HTMLElement | null = null;
    private _lastCount: number = -1;

    constructor() {
        super();

        this.settings.enable = {
            text: "Enable Inventory Counter",
            description: "Enable Inventory Counter",
            type: SettingsTypes.checkbox,
            value: true,
            callback: () => {
                if (this.settings.enable.value) {
                    this.createInventoryUI();
                } else {
                    if (this.inventoryUI) {
                        this.inventoryUI.remove();
                        this.inventoryUI = null;
                    }
                }
            }
        };

        this.settings.highlightOnFull = {
            text: "Highlight Red when full",
            description: "Highlight Red when full",
            type: SettingsTypes.checkbox,
            value: true,
            callback: () => {}
        };
    }

    init(): void {
        this.log("Inventory Counter Initialized");
    }

    start(): void {
        if (this.settings.enable.value) {
            this.createInventoryUI();
        }
    }

    stop(): void {
        if (this.inventoryUI) {
            this.inventoryUI.remove();
            this.inventoryUI = null;
        }
    }

    // UI
    createInventoryUI(): void {
        this.log("Creating Inventory Counter UI");
        if (this.inventoryUI) {
            this.inventoryUI.remove();
        }

        this.inventoryUI = this.uiManager.createElement(
            UIManagerScope.ClientInternal
        );

        if (!this.inventoryUI) {
            this.settings.enable.value = false;
            return;
        }

        // Positioning
        this.inventoryUI.style.position = "absolute";
        this.inventoryUI.style.height = "auto";
        this.inventoryUI.style.zIndex = "1000";
        this.inventoryUI.style.right = "235px";
        this.inventoryUI.style.bottom = "155px"; //154 for 9Px like CC
        this.inventoryUI.style.display = "flex";
        this.inventoryUI.style.flexDirection = "column";
        this.inventoryUI.style.justifyContent = "space-evenly";
        this.inventoryUI.style.width = "auto";
        this.inventoryUI.style.padding = "10px";
        this.inventoryUI.classList.add("hs-menu", "hs-game-menu");

        const inventorySpan = document.createElement("span");
        inventorySpan.style.display = "flex";
        inventorySpan.style.justifyContent = "center";

        // Icon
        const inventoryIcon = document.createElement("i");
        inventoryIcon.className = "iconify";
        inventoryIcon.setAttribute("data-icon", "material-symbols:inventory-2");
        inventoryIcon.ariaHidden = "true";
        inventoryIcon.style.marginRight = "10px";
        inventorySpan.appendChild(inventoryIcon);
        this.inventoryIconUI = inventoryIcon;

        // Counter text
        this.inventoryValueUI = document.createElement("span");
        this.inventoryValueUI.innerText = "0/28";
        inventorySpan.appendChild(this.inventoryValueUI);

        this.inventoryUI.appendChild(inventorySpan);
    }

    GameLoop_update(): void {
        // Early exit if disabled or no UI
        if (!this.settings.enable.value || !this.inventoryUI) {
            return;
        }
    
        // Menu positioning
        const menuOpen = document.getElementsByClassName("hs-game-menu--opened").length > 0;
        this.inventoryUI.style.right = menuOpen ? "235px" : "6px";
        this.inventoryUI.style.transition = menuOpen ? "none" : "all 0.1s ease-in-out";
    
        // Get current inventory count
        const inventoryItems = this.gameHooks.EntityManager.Instance.MainPlayer._inventory.Items || [];
        const occupiedSlots = inventoryItems.filter(item => item != null && item !== undefined).length;
    
        // Update text only when inventory changes
        if (occupiedSlots !== this._lastCount) {
            if (this.inventoryValueUI) {
                this.inventoryValueUI.innerText = `${occupiedSlots}/28`;
            }
            this._lastCount = occupiedSlots;
        }
    
        // Color Update
        const highlightEnabled = this.settings.highlightOnFull.value;
        const isFull = occupiedSlots >= 28;
        const shouldHighlight = highlightEnabled && isFull;
    
        if (shouldHighlight) {
            if (this.inventoryValueUI) {
                this.inventoryValueUI.style.color = "#ff4444"; //Red
                this.inventoryValueUI.style.fontWeight = "bold";
            }
            if (this.inventoryIconUI) {
                this.inventoryIconUI.style.color = "#ff4444";
            }
        } else {
            if (this.inventoryValueUI) {
                this.inventoryValueUI.style.color = "";
                this.inventoryValueUI.style.fontWeight = "";
            }
            if (this.inventoryIconUI) {
                this.inventoryIconUI.style.color = "";
            }
        }
    }
}