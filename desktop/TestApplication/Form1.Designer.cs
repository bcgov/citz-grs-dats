namespace TestApplication
{
    partial class Form1
    {
        /// <summary>
        ///  Required designer variable.
        /// </summary>
        private System.ComponentModel.IContainer components = null;

        /// <summary>
        ///  Clean up any resources being used.
        /// </summary>
        /// <param name="disposing">true if managed resources should be disposed; otherwise, false.</param>
        protected override void Dispose(bool disposing)
        {
            if (disposing && (components != null))
            {
                components.Dispose();
            }
            base.Dispose(disposing);
        }

        #region Windows Form Designer generated code

        /// <summary>
        ///  Required method for Designer support - do not modify
        ///  the contents of this method with the code editor.
        /// </summary>
        private void InitializeComponent()
        {
            textBox1 = new TextBox();
            button1 = new Button();
            openFileDialog1 = new OpenFileDialog();
            textBox2 = new TextBox();
            button3 = new Button();
            label1 = new Label();
            SuspendLayout();
            // 
            // textBox1
            // 
            textBox1.Location = new Point(12, 50);
            textBox1.Name = "textBox1";
            textBox1.Size = new Size(76, 23);
            textBox1.TabIndex = 0;
            textBox1.Text = "1024";
            // 
            // button1
            // 
            button1.Location = new Point(138, 50);
            button1.Name = "button1";
            button1.Size = new Size(99, 23);
            button1.TabIndex = 1;
            button1.Text = "Generate File";
            button1.UseVisualStyleBackColor = true;
            button1.Click += button1_Click;
            // 
            // openFileDialog1
            // 
            openFileDialog1.FileName = "openFileDialog1";
            // 
            // textBox2
            // 
            textBox2.Location = new Point(12, 136);
            textBox2.Multiline = true;
            textBox2.Name = "textBox2";
            textBox2.Size = new Size(225, 179);
            textBox2.TabIndex = 2;
            // 
            // button3
            // 
            button3.Location = new Point(12, 103);
            button3.Name = "button3";
            button3.Size = new Size(225, 23);
            button3.TabIndex = 4;
            button3.Text = "Select File to calculate checksum";
            button3.UseVisualStyleBackColor = true;
            button3.Click += button3_Click;
            // 
            // label1
            // 
            label1.AutoSize = true;
            label1.Location = new Point(94, 53);
            label1.Name = "label1";
            label1.Size = new Size(38, 15);
            label1.TabIndex = 5;
            label1.Text = "(MBs)";
            // 
            // Form1
            // 
            AutoScaleDimensions = new SizeF(7F, 15F);
            AutoScaleMode = AutoScaleMode.Font;
            ClientSize = new Size(249, 356);
            Controls.Add(label1);
            Controls.Add(button3);
            Controls.Add(textBox2);
            Controls.Add(button1);
            Controls.Add(textBox1);
            FormBorderStyle = FormBorderStyle.FixedDialog;
            MaximizeBox = false;
            MinimizeBox = false;
            Name = "Form1";
            SizeGripStyle = SizeGripStyle.Hide;
            Text = "Test Checksum Calculation";
            ResumeLayout(false);
            PerformLayout();
        }

        #endregion

        private TextBox textBox1;
        private Button button1;
        private OpenFileDialog openFileDialog1;
        private TextBox textBox2;
        private Button button3;
        private Label label1;
    }
}
