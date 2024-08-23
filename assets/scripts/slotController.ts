import { _decorator, Component, Node, Animation, Button, tween } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('NewComponent')
export class NewComponent extends Component {

    @property(Button)
    private startButton: Button = null

    @property(Node)
    private panel1: Node = null

    @property(Node)
    private panel2: Node = null

    @property(Node)
    private panel3: Node = null

    private panel1Start: boolean = false
    private panel2Start: boolean = false
    private panel3Start: boolean = false

    private panel1Controller: Animation = null;
    private panel2Controller: Animation = null;
    private panel3Controller: Animation = null;

    start() {
        if (!this.startButton) {
            console.error('StartButton component is not assigned.');
            return;
        }

        if (!this.panel1 || !this.panel2 || !this.panel3) {
            console.error('Panel node is not assigned.');
            return;
        }

        // 取得Panel上的Animation組件
        this.panel1Controller = this.panel1.getComponent(Animation)
        this.panel2Controller = this.panel2.getComponent(Animation)
        this.panel3Controller = this.panel3.getComponent(Animation)

        if (!this.panel1Controller || !this.panel2Controller || !this.panel3Controller) {
            console.error('Animation component on Panel is not found.');
            return;
        }

        this.startButton.node.on(Button.EventType.CLICK, this.slotGameAnimation, this)
    }

    update(deltaTime: number) {
    }

    //老虎機輪盤轉動動畫 
    slotGameAnimation() {
        if (!this.panel1Start && !this.panel2Start && !this.panel3Start) {
            console.log("All start")
            this.resetAllPanels();
            this.panel1Controller.play()
            this.panel2Controller.play()
            this.panel3Controller.play()
            this.panel1Start = true
            this.panel2Start = true
            this.panel3Start = true
        } else if (this.panel1Start) {
            // this.panel1Controller.pause()
            this.slowDownAnimation(this.panel1Controller); 4
            console.log("Stop panel1");
            this.panel1Start = false
        } else if (this.panel2Start) {
            // this.panel2Controller.pause()
            this.slowDownAnimation(this.panel2Controller);
            console.log("Stop panel2");
            this.panel2Start = false
        } else if (this.panel3Start) {
            // this.panel3Controller.pause()
            console.log("Stop panel3");
            this.slowDownAnimation(this.panel3Controller);
            this.panel3Start = false
        }
    }

    // 輪盤漸停動畫
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
                    }
                })
                .start();
        }
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
}


