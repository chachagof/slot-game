import { _decorator, Component, Node, Animation, Button } from 'cc';
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

    private isStart: boolean = false

    private animationPanel1: Animation = null;
    private animationPanel2: Animation = null;
    private animationPanel3: Animation = null;

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
        this.animationPanel1 = this.panel1.getComponent(Animation);
        this.animationPanel2 = this.panel2.getComponent(Animation);
        this.animationPanel3 = this.panel3.getComponent(Animation);

        if (!this.animationPanel1 || !this.animationPanel2 || !this.animationPanel3) {
            console.error('Animation component on Panel is not found.');
            return;
        }

        this.startButton.node.on(Button.EventType.CLICK, this.toggleAnimation, this)
    }

    update(deltaTime: number) {

    }

    toggleAnimation() {
        if (this.isStart) {
            this.animationPanel1.pause()  // 暫停動畫
            this.animationPanel2.pause()
            this.animationPanel3.pause()
        } else {
            this.animationPanel1.play()  // 播放動畫
            this.animationPanel2.play()
            this.animationPanel3.play()
        }
        console.log("Button pressed, toggle animation.");
        this.isStart = !this.isStart;  // 切換狀態
    }
}


