import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { TemplateService } from '../templates/template.service';
import { MessageService } from './message.service';
import { EmailTemplate } from '../../core/models/email-template.model';
import { AuthService } from '../../core/services/auth.service';
import { UserService } from '../../core/services/user.service';
import { MatDialog } from '@angular/material/dialog';
import { TemplateDetailComponent } from '../template-detail/template-detail.component';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Inject } from '@angular/core';

@Component({
  selector: 'app-send-email',
  templateUrl: './send-email.component.html',
  styleUrls: ['./send-email.component.scss'],
  imports: [FormsModule, CommonModule],
  standalone: true
})
export class SendEmailComponent implements OnInit {
  public Object = Object;
  templates: EmailTemplate[] = [];
  selectedCode = '';
  placeholders: { [key: string]: string } = {};
  variables: { [k: string]: string } = {};
  to = '';
  msg = '';
  userId: number | null = null;
  previewHtml = '';
  constructor(
    private templateService: TemplateService,
    private messageService: MessageService,
    private authService: AuthService,
    private userService: UserService,
    private dialog: MatDialog
  ) {}
  ngOnInit() {
    this.templateService.getPage().subscribe((res: any) => {
      if (res.success) {
        this.templates = res.data.content || [];
      }
    });
    const username = this.authService.getUsername();
    if (username) {
      this.userService.getUsers().subscribe(users => {
        const user = users.find(u => u.username === username);
        this.userId = user?.id ?? null;
      });
    }
  }
  onTemplateChange() {
    const t = this.templates.find(t => t.code === this.selectedCode);
    this.placeholders = t ? t.placeholders || {} : {};
    this.variables = { ...this.placeholders };
    this.previewHtml = '';
  }
  renderPreview() {
    const t = this.templates.find(t => t.code === this.selectedCode);
    if (!t) {
      this.previewHtml = '';
      return '';
    }
    let html = t.content;
    Object.keys(this.variables).forEach(key => {
      const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
      html = html.replace(regex, this.variables[key] || '');
    });
    this.previewHtml = html;
    return html;
  }
  send() {
    if (!this.userId) {
      this.msg = 'Không tìm thấy userId!';
      return;
    }
    this.messageService.send({
      templateCode: this.selectedCode,
      userId: this.userId,
      placeholders: this.variables
    }).subscribe({
      next: () => this.msg = 'Gửi thành công!',
      error: () => this.msg = 'Gửi thất bại!'
    });
  }

  openDetail(id: number) {
    this.dialog.open(TemplateDetailComponent, {
      width: '600px',
      data: { id }
    });
  }
} 