import { _decorator, Component, Node, Animation, Button, tween, Label } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('NewComponent')
export class NewComponent extends Component {

    @property(Button)
    private startButton: Button = null

    @property(Button)
    private plusButton: Button = null

    @property(Button)
    private minusButton: Button = null

    @property(Node)
    private panel1: Node = null

    @property(Node)
    private panel2: Node = null

    @property(Node)
    private panel3: Node = null

    @property(Node)
    private endUI: Node = null

    @property(Label)
    private betLabel: Label = null

    @property(Label)
    private winLabel: Label = null

    @property(Label)
    private moneyLabel: Label = null

    @property
    private betValue: number = 1

    @property
    private winValue: number = 0

    @property
    private playerMoney: number = 1000



    private panel1Start: boolean = false
    private panel2Start: boolean = false
    private panel3Start: boolean = false

    private panel1Controller: Animation = null;
    private panel2Controller: Animation = null;
    private panel3Controller: Animation = null;

    private slotElement: string[] = []

    start() {
        if (!this.startButton) {
            console.error('StartButton component is not assigned.');
            return;
        }

        if (!this.panel1 || !this.panel2 || !this.panel3) {
            console.error('Panel node is not assigned.');
            return;
        }

        // 隱藏中獎資訊
        this.endUI.active = false;

        // 取得Panel上的Animation組件
        this.panel1Controller = this.panel1.getComponent(Animation)
        this.panel2Controller = this.panel2.getComponent(Animation)
        this.panel3Controller = this.panel3.getComponent(Animation)

        if (!this.panel1Controller || !this.panel2Controller || !this.panel3Controller) {
            console.error('Animation component on Panel is not found.');
            return;
        }

        // 初始化play panel
        if (!this.betLabel || !this.winLabel || !this.moneyLabel) {
            console.error('Label component is not found.')
        }

        this.betLabel.string = this.betValue.toString()
        this.winLabel.string = this.winValue.toString()
        this.moneyLabel.string = this.playerMoney.toString()

        this.startButton.node.on(Button.EventType.CLICK, this.slotGameAnimation, this)
        this.plusButton.node.on(Button.EventType.CLICK, this.increaseButton, this)
        this.minusButton.node.on(Button.EventType.CLICK, this.decreaseButton, this)
    }

    update(deltaTime: number) {
    }

    //老虎機輪盤轉動動畫 
    slotGameAnimation() {
        if (!this.panel1Start && !this.panel2Start && !this.panel3Start) {
            console.log("All start")

            // 隱藏 jackpot UI 
            this.endUI.active = false;
            // 清空輪盤元素
            this.slotElement.length = 0
            // 恢復輪盤動畫速度
            this.resetAllPanels();
            // 啟動輪盤
            this.panel1Controller.play()
            this.panel2Controller.play()
            this.panel3Controller.play()
            // 設定輪盤狀態
            this.panel1Start = true
            this.panel2Start = true
            this.panel3Start = true
            // 扣除下注金額
            this.moneyLabel.string = (Number(this.moneyLabel.string) - Number(this.betLabel.string)).toString()
            // 恢復中獎金額顯示
            this.winLabel.string = '0'
        } else if (this.panel1Start) {
            this.slowDownAnimation(this.panel1Controller); 4
            console.log("Stop panel1");
            this.panel1Start = false
        } else if (this.panel2Start) {
            this.slowDownAnimation(this.panel2Controller);
            console.log("Stop panel2");
            this.panel2Start = false
        } else if (this.panel3Start) {
            console.log("Stop panel3");
            this.slowDownAnimation(this.panel3Controller);
            this.panel3Start = false
        }
    }

    slowDownAnimation(controller: Animation) {
        const animState = controller.getState(controller.defaultClip.name);
        if (animState) {
            const duration = 1; // 緩停持續時間（秒）
            const startSpeed = animState.speed;

            // 停止當前可能正在進行的 tween
            tween(controller).stop();

            // 創建新的 tween
            tween(controller as any)
                .to(duration, {
                    speed: 0
                }, {
                    easing: 'quadOut',
                    onUpdate: (target: any, ratio: number) => {
                        animState.speed = startSpeed * (1 - ratio);
                    },
                    onComplete: () => {
                        controller.pause();
                        this.snapToClosestNode(controller.node);
                    }
                })
                .start();
        }
    }

    // 將動畫節點對齊到最接近的目標節點位置
    snapToClosestNode(node: Node) {
        const targetYPositions = [-20, -190, -360, -530, -700, -870]
        // const targetYPositions = [-20, -20, -20, -20, , -20]; // for test
        const targetNodeName = ['bw', 'br', 'bg', 'bo', 'bb', 'bw']

        // 找到最接近當前Y位置的目標節點
        const currentY = node.position.y;
        let closestY = targetYPositions[0];
        let beanName = targetNodeName[0]
        let minDiff = Math.abs(currentY - closestY);

        for (let i = 1; i < targetYPositions.length; i++) {
            const diff = Math.abs(currentY - targetYPositions[i]);
            if (diff < minDiff) {
                closestY = targetYPositions[i];
                beanName = targetNodeName[i]
                minDiff = diff;
            }
        }

        this.slotElement.push(beanName)

        console.log(`Now slot element is ${this.slotElement}`)

        // 將節點位置調整到最接近的目標節點
        node.setPosition(node.position.x, closestY, node.position.z);
        this.checkWin(this.slotElement)
    }

    // 重製輪盤動畫速度
    resetAllPanels() {
        [this.panel1Controller, this.panel2Controller, this.panel3Controller].forEach(controller => {
            const animState = controller.getState(controller.defaultClip.name);
            if (animState) {
                animState.speed = 1;
            }
        });
    }

    checkWin(slot: string[]) {
        if (slot.length === 3) {
            console.log('Now is run checkWin and check slot element')
            const win = slot.every(cur => cur === slot[0])
            if (win) {
                console.log('Player win the money and update UI')
                // 更改贏錢金額顯示
                this.winLabel.string = this.betLabel.string
                // 更改玩家金錢
                this.moneyLabel.string = (Number(this.moneyLabel.string) + Number(this.betLabel.string) * 2).toString()
                // 顯示中獎UI
                this.endUI.active = true
                return
            }
        }
    }

    increaseButton() {
        if (this.betValue < this.playerMoney) {
            this.betValue += 1
            this.betLabel.string = this.betValue.toString()
        }
    }

    decreaseButton() {
        if (this.betValue > 1) {
            this.betValue -= 1
            this.betLabel.string = this.betValue.toString()
        }
    }


}


